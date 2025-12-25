import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentActivity() {
	const activities = [
		{
			id: "activity-1",
			deck: "Chinese Grade 7 - Lesson 1",
			action: "Completed 20 questions",
			time: "2 mins ago",
			score: "+20 XP",
			initial: "C",
		},
		{
			id: "activity-2",
			deck: "Idioms - Animals",
			action: "Added 5 new cards",
			time: "1 hr ago",
			score: "New",
			initial: "A",
		},
		{
			id: "activity-3",
			deck: "Advanced Pronunciation",
			action: "Achieved 7-day streak",
			time: "5 hrs ago",
			score: "Streak",
			initial: "P",
		},
		{
			id: "activity-4",
			deck: "Classic Poetry",
			action: "Practice accuracy 95%",
			time: "Yesterday",
			score: "A+",
			initial: "Po",
		},
		{
			id: "activity-5",
			deck: "Frequently Wrong Review",
			action: "Corrected 3 errors",
			time: "Yesterday",
			score: "Fix",
			initial: "W",
		},
	];

	return (
		<div className="space-y-8">
			{activities.map((item) => (
				<div key={item.id} className="flex items-center">
					<Avatar className="h-9 w-9 bg-slate-100 dark:bg-slate-800 border">
						<AvatarImage src="/avatars/01.png" alt="Avatar" />
						<AvatarFallback className="text-slate-700 dark:text-slate-300">
							{item.initial}
						</AvatarFallback>
					</Avatar>
					<div className="ml-4 space-y-1">
						<p className="text-sm font-medium leading-none">{item.deck}</p>
						<p className="text-xs text-muted-foreground">{item.action}</p>
					</div>
					<div className="ml-auto font-medium text-xs text-slate-500">
						{item.time}
					</div>
				</div>
			))}
		</div>
	);
}
