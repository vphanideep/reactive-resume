import { ArrowSquareOutIcon, CreditCardIcon, CrownIcon, SparkleIcon } from "@phosphor-icons/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { orpc } from "@/integrations/orpc/client";
import { PLAN_LIMITS } from "@/utils/plan";
import { DashboardHeader } from "../-components/header";

export const Route = createFileRoute("/dashboard/settings/billing")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: billingStatus, isLoading } = useQuery(orpc.billing.getStatus.queryOptions());

	const { data: pdfUsage } = useQuery(
		orpc.billing.getUsage.queryOptions({ input: { type: "pdf_download" } }),
	);

	const { data: aiUsage } = useQuery(
		orpc.billing.getUsage.queryOptions({ input: { type: "ai_suggestion" } }),
	);

	const { mutate: createCheckout, isPending: isCheckoutPending } = useMutation(
		orpc.billing.createCheckout.mutationOptions(),
	);

	const { mutate: createPortal, isPending: isPortalPending } = useMutation(
		orpc.billing.createPortal.mutationOptions(),
	);

	const plan = billingStatus?.plan ?? "free";
	const isPro = plan === "pro";
	const limits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS];

	const handleUpgrade = () => {
		createCheckout(
			{
				successUrl: `${window.location.origin}/dashboard/settings/billing?upgraded=true`,
				cancelUrl: `${window.location.origin}/dashboard/settings/billing`,
			},
			{
				onSuccess: (data) => {
					if (data.url) window.location.href = data.url;
				},
			},
		);
	};

	const handleManageSubscription = () => {
		createPortal(
			{ returnUrl: `${window.location.origin}/dashboard/settings/billing` },
			{
				onSuccess: (data) => {
					if (data.url) window.location.href = data.url;
				},
			},
		);
	};

	if (isLoading) {
		return (
			<div className="space-y-4">
				<DashboardHeader icon={CreditCardIcon} title="Billing" />
				<Separator />
				<p className="text-muted-foreground text-sm">Loading billing information...</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<DashboardHeader icon={CreditCardIcon} title="Billing" />

			<Separator />

			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3 }}
				className="max-w-xl space-y-8"
			>
				{/* Current Plan */}
				<div className="space-y-3">
					<h3 className="font-medium text-sm">Current Plan</h3>
					<div className="flex items-center gap-3 rounded-lg border p-4">
						{isPro ? (
							<CrownIcon size={24} weight="fill" className="text-amber-500" />
						) : (
							<SparkleIcon size={24} weight="fill" className="text-muted-foreground" />
						)}
						<div className="flex-1">
							<div className="flex items-center gap-2">
								<span className="font-semibold">{isPro ? "Pro" : "Free"}</span>
								<Badge variant={isPro ? "default" : "secondary"}>
									{isPro ? "$10/month" : "Free"}
								</Badge>
							</div>
							<p className="text-muted-foreground text-sm">
								{isPro
									? "You have access to all features."
									: "Upgrade to Pro for unlimited resumes, downloads, and AI suggestions."}
							</p>
						</div>
						{isPro ? (
							<Button variant="outline" size="sm" onClick={handleManageSubscription} disabled={isPortalPending}>
								Manage
								<ArrowSquareOutIcon className="size-4" />
							</Button>
						) : (
							<Button size="sm" onClick={handleUpgrade} disabled={isCheckoutPending}>
								Upgrade to Pro
							</Button>
						)}
					</div>
				</div>

				{/* Usage */}
				<div className="space-y-3">
					<h3 className="font-medium text-sm">Usage This Month</h3>
					<div className="space-y-3">
						<UsageBar
							label="PDF Downloads"
							used={pdfUsage?.count ?? 0}
							limit={limits.maxPdfDownloadsPerMonth}
						/>
						<UsageBar
							label="AI Suggestions"
							used={aiUsage?.count ?? 0}
							limit={limits.maxAiSuggestionsPerMonth}
						/>
					</div>
				</div>

				{/* Plan Limits */}
				<div className="space-y-3">
					<h3 className="font-medium text-sm">Plan Limits</h3>
					<div className="grid grid-cols-2 gap-3">
						<LimitCard label="Resumes" value={limits.maxResumes === Infinity ? "Unlimited" : String(limits.maxResumes)} />
						<LimitCard label="PDF Downloads / Month" value={limits.maxPdfDownloadsPerMonth === Infinity ? "Unlimited" : String(limits.maxPdfDownloadsPerMonth)} />
						<LimitCard label="AI Suggestions / Month" value={limits.maxAiSuggestionsPerMonth === Infinity ? "Unlimited" : String(limits.maxAiSuggestionsPerMonth)} />
						<LimitCard label="PDF Watermark" value={limits.watermarkPdf ? "Yes" : "No"} />
						<LimitCard label="Premium Templates" value={limits.premiumTemplates ? "All" : "3 basic"} />
						<LimitCard label="Custom Public URL" value={limits.customPublicUrl ? "Yes" : "No"} />
					</div>
				</div>
			</motion.div>
		</div>
	);
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
	const isUnlimited = limit === Infinity;
	const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
	const isNearLimit = !isUnlimited && percentage >= 80;

	return (
		<div className="rounded-lg border p-3">
			<div className="flex items-center justify-between text-sm">
				<span>{label}</span>
				<span className="text-muted-foreground">
					{isUnlimited ? `${used} used` : `${used} / ${limit}`}
				</span>
			</div>
			{!isUnlimited && (
				<div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
					<div
						className={`h-full rounded-full transition-all ${isNearLimit ? "bg-amber-500" : "bg-primary"}`}
						style={{ width: `${percentage}%` }}
					/>
				</div>
			)}
		</div>
	);
}

function LimitCard({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border p-3">
			<p className="text-muted-foreground text-xs">{label}</p>
			<p className="font-semibold text-sm">{value}</p>
		</div>
	);
}
