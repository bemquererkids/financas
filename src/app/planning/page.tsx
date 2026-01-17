import { getPlanningData } from "@/app/actions/planning-actions";
import { PlanningGrid } from "@/components/planning/PlanningGrid";

export const dynamic = 'force-dynamic';

export default async function PlanningPage() {
    const data = await getPlanningData();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 h-full flex flex-col">
            <div className="flex items-center justify-between space-y-2 mb-4">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-1">Planejamento Futuro</h2>
                    <p className="text-slate-400">Projete seus meses e simule cenários.</p>
                </div>
            </div>

            <PlanningGrid initialData={data} />
        </div>
    );
}
