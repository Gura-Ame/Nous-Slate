import { Coins, Heart, Target, Tv } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { AdService } from "@/services/ad-service";
import { PointsService } from "@/services/points-service";
import type { Ad, UserProfile } from "@/types/schema";

export default function AdCenter() {
	const { user } = useAuth();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [ads, setAds] = useState<Ad[]>([]);

	// 廣告登錄 Form
	const [adTitle, setAdTitle] = useState("");
	const [adBid, setAdBid] = useState(10);
	const [adTags, setAdTags] = useState("");

	const refreshData = useCallback(async () => {
		if (user) {
			const p = await PointsService.getUserProfile(user.uid);
			setProfile(p);
			const recommended = await AdService.getRecommendedAds(user.uid);
			setAds(recommended);
		}
	}, [user]);

	useEffect(() => {
		refreshData();
	}, [refreshData]);

	// 觀看廣告
	const handleWatch = async (ad: Ad) => {
		if (!user) return;
		toast.promise(
			new Promise((resolve) => setTimeout(resolve, 2000)), // 模擬看廣告 2秒
			{
				loading: "廣告播放中...",
				success: () => {
					AdService.watchAd(user.uid, ad).then(() => refreshData());
					return `已獲得 ${ad.rewardPoints} 積分！`;
				},
				error: "播放失敗",
			},
		);
	};

	// 模擬捐贈
	const handleDonate = async () => {
		if (!user) return;
		if (confirm("確認支付 $1 USD? (模擬)")) {
			await PointsService.updatePoints(
				user.uid,
				1000,
				"donation",
				"捐贈 $1 USD",
			);
			toast.success("感謝支持！獲得 1000 積分");
			refreshData();
		}
	};

	// 登錄廣告
	const handleRegisterAd = async () => {
		if (!user) return;
		await AdService.registerAd(user.uid, {
			title: adTitle,
			content: "https://placeholder.com",
			bidPoints: Number(adBid),
			rewardPoints: Math.floor(Number(adBid) * 0.5), // 使用者拿一半
			targetTags: adTags.split(",").map((t) => t.trim()),
		});
		toast.success("廣告刊登成功！");
		setAdTitle("");
	};

	if (!user) return <div>請先登入</div>;

	return (
		<div className="container mx-auto p-8 space-y-8">
			{/* Header Stats */}
			<div className="flex items-center justify-between bg-slate-900 text-white p-8 rounded-2xl shadow-lg">
				<div>
					<h1 className="text-3xl font-bold mb-2">積分中心</h1>
					<p className="opacity-80">賺取積分，解鎖更多練習機會。</p>
				</div>
				<div className="text-right">
					<div className="text-sm opacity-60">目前餘額</div>
					<div className="text-5xl font-mono font-bold text-yellow-400 flex items-center gap-2">
						<Coins className="h-8 w-8" />
						{profile?.points?.toFixed(1) || 0}
					</div>
				</div>
			</div>

			<Tabs defaultValue="earn" className="space-y-4">
				<TabsList>
					<TabsTrigger value="earn">賺取積分 (看廣告)</TabsTrigger>
					<TabsTrigger value="donate">贊助支持</TabsTrigger>
					<TabsTrigger value="advertise">我是廣告主</TabsTrigger>
				</TabsList>

				{/* 1. 看廣告 (推薦系統) */}
				<TabsContent value="earn" className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{ads.map((ad) => (
							<Card
								key={ad.id}
								className="hover:border-primary transition-colors cursor-pointer"
								onClick={() => handleWatch(ad)}
							>
								<CardHeader>
									<CardTitle className="flex justify-between items-start">
										{ad.title}
										<Badge className="bg-yellow-500 hover:bg-yellow-600">
											+{ad.rewardPoints} 分
										</Badge>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex gap-2 flex-wrap">
										{ad.targetTags.map((t) => (
											<Badge key={t} variant="outline" className="text-xs">
												#{t}
											</Badge>
										))}
									</div>
								</CardContent>
								<CardFooter className="text-xs text-muted-foreground">
									<Tv className="h-3 w-3 mr-1" /> 點擊觀看
								</CardFooter>
							</Card>
						))}
						{ads.length === 0 && (
							<div className="p-8 text-center text-muted-foreground">
								目前沒有適合您的廣告。
							</div>
						)}
					</div>
				</TabsContent>

				{/* 2. 捐贈 */}
				<TabsContent value="donate">
					<Card>
						<CardHeader>
							<CardTitle>支持 Nous Slate 開發</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="mb-4">
								您的支持是我們持續維護伺服器的動力。每捐贈 1 美金，將回饋您 1000
								積分。
							</p>
							<Button
								onClick={handleDonate}
								className="w-full sm:w-auto gap-2 bg-pink-600 hover:bg-pink-700"
							>
								<Heart className="h-4 w-4 fill-current" /> 捐贈 $1 USD
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* 3. 廣告主登錄 */}
				<TabsContent value="advertise">
					<Card>
						<CardHeader>
							<CardTitle>刊登您的廣告</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-2">
								<Label>廣告標題</Label>
								<Input
									value={adTitle}
									onChange={(e) => setAdTitle(e.target.value)}
									placeholder="例如：最強國文補習班"
								/>
							</div>
							<div className="grid gap-2">
								<Label>目標受眾標籤 (逗號分隔)</Label>
								<Input
									value={adTags}
									onChange={(e) => setAdTags(e.target.value)}
									placeholder="國文, 考試, 升學"
								/>
							</div>
							<div className="grid gap-2">
								<Label>出價 (每次觀看支付積分)</Label>
								<Input
									type="number"
									value={adBid}
									onChange={(e) => setAdBid(Number(e.target.value))}
								/>
								<p className="text-xs text-muted-foreground">
									出價越高，在推薦列表中的排名越靠前。
								</p>
							</div>
							<Button onClick={handleRegisterAd} className="gap-2">
								<Target className="h-4 w-4" /> 刊登廣告
							</Button>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
