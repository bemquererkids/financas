import { getPlanningData } from "@/app/actions/planning-actions";
import { PlanningGrid } from "@/components/planning/PlanningGrid";
import { ModuleHeader } from "@/components/dashboard/ModuleHeader";

export const dynamic = 'force-dynamic';

export default async function PlanningPage() {
    const data = await getPlanningData();

    return (
        <div className="flex-1 space-y-4 p-8 pt-6 h-full flex flex-col">
            <ModuleHeader
                title="Planejamento Futuro"
                subtitle="Projete seus meses e simule cenários"
            />

            <PlanningGrid initialData={data} />
        </div>
    );
}
