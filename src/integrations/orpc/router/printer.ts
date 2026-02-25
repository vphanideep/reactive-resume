import { ORPCError } from "@orpc/client";
import z from "zod";
import { getPlanLimits, type Plan } from "@/utils/plan";
import { protectedProcedure, publicProcedure } from "../context";
import { billingService, isBillingEnabled } from "../services/billing";
import { printerService } from "../services/printer";
import { resumeService } from "../services/resume";

export const printerRouter = {
	printResumeAsPDF: publicProcedure
		.route({
			method: "GET",
			path: "/resumes/{id}/pdf",
			tags: ["Resume Export"],
			operationId: "exportResumePdf",
			summary: "Export resume as PDF",
			description:
				"Generates a PDF from the specified resume and uploads it to storage. Returns a URL to download the generated PDF file. If the request is made by an unauthenticated user (e.g. via a public share link), the resume's download count is incremented. Authentication is optional.",
			successDescription: "The PDF was generated successfully. Returns a URL to download the file.",
		})
		.input(z.object({ id: z.string().describe("The unique identifier of the resume to export.") }))
		.output(z.object({ url: z.string().describe("The URL to download the generated PDF file.") }))
		.handler(async ({ input, context }) => {
			const { id, data, userId } = await resumeService.getByIdForPrinter({ id: input.id });

			// Enforce download limits for authenticated users when billing is enabled
			if (context.user && isBillingEnabled()) {
				const { plan } = await billingService.getStatus({ userId: context.user.id });
				const limits = getPlanLimits(plan as Plan);
				const { count } = await billingService.getUsage({ userId: context.user.id, type: "pdf_download" });

				if (count >= limits.maxPdfDownloadsPerMonth) {
					throw new ORPCError("PLAN_LIMIT_REACHED", {
						status: 403,
						message: `You have reached the maximum of ${limits.maxPdfDownloadsPerMonth} PDF downloads this month. Upgrade to Pro for unlimited downloads.`,
					});
				}
			}

			const url = await printerService.printResumeAsPDF({ id, data, userId });

			// Track usage for authenticated users, track statistics for public downloads
			if (context.user && isBillingEnabled()) {
				await billingService.incrementUsage({ userId: context.user.id, type: "pdf_download" });
			}

			await resumeService.statistics.increment({ id: input.id, downloads: true });

			return { url };
		}),

	getResumeScreenshot: protectedProcedure
		.route({
			method: "GET",
			path: "/resumes/{id}/screenshot",
			tags: ["Resume Export"],
			operationId: "getResumeScreenshot",
			summary: "Get resume screenshot",
			description:
				"Returns a URL to a screenshot image of the first page of the specified resume. Screenshots are cached for up to 6 hours and regenerated automatically when the resume is updated. Returns null if the screenshot cannot be generated. Requires authentication.",
			successDescription: "The screenshot URL, or null if the screenshot could not be generated.",
		})
		.input(z.object({ id: z.string().describe("The unique identifier of the resume.") }))
		.output(z.object({ url: z.string().nullable().describe("The URL to the screenshot image, or null.") }))
		.handler(async ({ input }) => {
			try {
				const { id, data, userId, updatedAt } = await resumeService.getByIdForPrinter({ id: input.id });
				const url = await printerService.getResumeScreenshot({ id, data, userId, updatedAt });

				return { url };
			} catch {
				// ignore errors, as the screenshot is not critical
			}

			return { url: null };
		}),
};
