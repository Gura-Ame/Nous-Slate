import { Coins, Heart, Target, Tv } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { GlassButton } from "@/components/ui/glass/GlassButton";
import { GlassCard } from "@/components/ui/glass/GlassCard";
import { GlassPage } from "@/components/ui/glass/GlassPage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { AdService } from "@/services/ad-service";
import { PointsService } from "@/services/points-service";
import type { Ad, UserProfile } from "@/types/schema";

export default function AdCenter() {
	const { t } = useTranslation();
	const { user } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [ads, setAds] = useState<Ad[]>([]);

	// Ad registration Form
	const [adTitle, setAdTitle] = useState("");
	const [adBid, setAdBid] = useState(10);
	const [adTags, setAdTags] = useState("");

	// Data fetching
	useEffect(() => {
		let mounted = true;

		const loadData = async () => {
			if (!user) return;
			try {
				const p = await PointsService.getUserProfile(user.uid);
				if (mounted) setProfile(p);

				const recommended = await AdService.getRecommendedAds(user.uid);
				if (mounted) setAds(recommended);
			} catch (error) {
				console.error(error);
			}
		};

		loadData();

		return () => {
			mounted = false;
		};
	}, [user]);

	// Use a ref to track mount status for other async ops
	const isMounted = useRef(true);
	useEffect(() => {
		isMounted.current = true;
		return () => {
			isMounted.current = false;
		};
	}, []);

	const refreshData = useCallback(async () => {
		if (!user) return;
		const p = await PointsService.getUserProfile(user.uid);
		if (isMounted.current) setProfile(p);
		const recommended = await AdService.getRecommendedAds(user.uid);
		if (isMounted.current) setAds(recommended);
	}, [user]);

	// Watch Ad
	const handleWatch = async (ad: Ad) => {
		if (!user) return;
		toast.promise(
			new Promise((resolve) => setTimeout(resolve, 2000)), // Simulate watching ad for 2 seconds
			{
				loading: t("adcenter.ad_loading", "Playing Ad..."),
				success: () => {
					AdService.watchAd(user.uid, ad).then(() => refreshData());
					return t("adcenter.ad_success", { points: ad.rewardPoints });
				},
				error: t("common.error", "Error"),
			},
		);
	};

	// Simulate Donation
	const handleDonate = async () => {
		if (!user) return;
		if (confirm(t("common.confirm", "Confirm payment?"))) {
			await PointsService.updatePoints(user.uid, 1000, "donation", "Donation");
			toast.success(t("adcenter.ad_success", { points: 1000 }));
			refreshData();
		}
	};

	// Register Ad
	const handleRegisterAd = async () => {
		if (!user) return;
		await AdService.registerAd(user.uid, {
			title: adTitle,
			content: "https://placeholder.com",
			bidPoints: Number(adBid),
			rewardPoints: Math.floor(Number(adBid) * 0.5), // User gets half
			targetTags: adTags.split(",").map((t) => t.trim()),
		});
		toast.success(t("adcenter.publish_success", "Ad published!"));
		setAdTitle("");
	};

	if (!user)
		return <div>{t("common.login_required", "Please login first")}</div>;

	return (
		<GlassPage className="flex justify-center">
			<div className="container p-8 space-y-8 max-w-7xl">
				{/* Header Stats */}
				<GlassCard
					className="flex items-center justify-between bg-slate-900/80 text-white p-8 rounded-3xl"
					variant="hover-glow"
				>
					<div>
						<h1 className="text-3xl font-bold mb-2">
							{t("adcenter.title", "Points Center")}
						</h1>
						<p className="opacity-80">
							{t("adcenter.description", "Earn points.")}
						</p>
					</div>
					<div className="text-right">
						<div className="text-sm opacity-60">
							{t("common.points_balance", "Current Balance")}
						</div>
						<div className="text-5xl font-mono font-bold text-yellow-400 flex items-center gap-2">
							<Coins className="h-8 w-8" />
							{profile?.points?.toFixed(1) || 0}
						</div>
					</div>
				</GlassCard>

				<Tabs defaultValue="earn" className="space-y-4">
					<TabsList className="bg-white/20 backdrop-blur-md border border-white/20 p-1 rounded-xl">
						<TabsTrigger
							value="earn"
							className="data-[state=active]:bg-white/50 data-[state=active]:shadow-sm rounded-lg"
						>
							{t("adcenter.earn_tab", "Earn Points")}
						</TabsTrigger>
						<TabsTrigger
							value="donate"
							className="data-[state=active]:bg-white/50 data-[state=active]:shadow-sm rounded-lg"
						>
							{t("adcenter.donate_tab", "Donate")}
						</TabsTrigger>
						<TabsTrigger
							value="advertise"
							className="data-[state=active]:bg-white/50 data-[state=active]:shadow-sm rounded-lg"
						>
							{t("adcenter.advertiser_tab", "Advertiser")}
						</TabsTrigger>
					</TabsList>

					{/* 1. Watch Ads (Recommendation System) */}
					<TabsContent value="earn" className="space-y-4">
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{ads.map((ad) => (
								<GlassCard
									key={ad.id}
									interactive
									className="p-4"
									onClick={() => handleWatch(ad)}
								>
									<div className="flex flex-col h-full space-y-4">
										<div className="flex justify-between items-start">
											<h3 className="font-bold text-lg">{ad.title}</h3>
											<Badge className="bg-yellow-500 hover:bg-yellow-600">
												+{ad.rewardPoints} {t("common.points", "Pts")}
											</Badge>
										</div>
										<div className="flex gap-2 flex-wrap flex-1">
											{ad.targetTags.map((t) => (
												<Badge key={t} variant="outline" className="text-xs">
													#{t}
												</Badge>
											))}
										</div>
										<div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-slate-100 dark:border-slate-800">
											<Tv className="h-3 w-3 mr-1" />{" "}
											{t("adcenter.watch_ad", "Watch Ad")}
										</div>
									</div>
								</GlassCard>
							))}
							{ads.length === 0 && (
								<div className="col-span-full p-8 text-center text-muted-foreground bg-white/10 rounded-2xl border border-white/10">
									{t("adcenter.no_ads", "No ads found.")}
								</div>
							)}
						</div>
					</TabsContent>

					{/* 2. Donate */}
					<TabsContent value="donate">
						<GlassCard className="p-6">
							<h3 className="text-xl font-bold mb-4">
								{t("adcenter.support_dev", "Support Nous Slate")}
							</h3>
							<p className="mb-6 text-slate-600 dark:text-slate-300">
								{t("adcenter.support_desc", "Donate to support.")}
							</p>
							<GlassButton
								onClick={handleDonate}
								className="w-full sm:w-auto gap-2 bg-pink-600 hover:bg-pink-700 text-white shadow-pink-500/30"
							>
								<Heart className="h-4 w-4 fill-current" />{" "}
								{t("adcenter.donate_btn", "Donate $1")}
							</GlassButton>
						</GlassCard>
					</TabsContent>

					{/* 3. Advertiser Registration */}
					<TabsContent value="advertise">
						<GlassCard className="p-6">
							<h3 className="text-xl font-bold mb-6">
								{t("adcenter.register_ad", "Publish Ad")}
							</h3>
							<div className="space-y-4">
								<div className="grid gap-2">
									<Label>{t("adcenter.ad_title", "Title")}</Label>
									<Input
										value={adTitle}
										onChange={(e) => setAdTitle(e.target.value)}
										className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm"
									/>
								</div>
								<div className="grid gap-2">
									<Label>{t("adcenter.target_tags", "Tags")}</Label>
									<Input
										value={adTags}
										onChange={(e) => setAdTags(e.target.value)}
										className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm"
									/>
								</div>
								<div className="grid gap-2">
									<Label>{t("adcenter.bid", "Bid")}</Label>
									<Input
										type="number"
										value={adBid}
										onChange={(e) => setAdBid(Number(e.target.value))}
										className="bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm"
									/>
									<p className="text-xs text-muted-foreground">
										{t("adcenter.bid_desc", "Higher bids rank higher.")}
									</p>
								</div>
								<GlassButton
									onClick={handleRegisterAd}
									className="gap-2 w-full sm:w-auto"
								>
									<Target className="h-4 w-4" />{" "}
									{t("adcenter.publish_btn", "Publish")}
								</GlassButton>
							</div>
						</GlassCard>
					</TabsContent>
				</Tabs>
			</div>
		</GlassPage>
	);
}
