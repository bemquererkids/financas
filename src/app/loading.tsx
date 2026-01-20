export default function Loading() {
    return (
        <div className="flex-1 p-6 space-y-8 animate-pulse">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 bg-white/5 rounded-full" />
                <div className="h-10 w-px bg-white/10 mx-2" />
                <div className="space-y-2">
                    <div className="h-6 w-48 bg-white/5 rounded" />
                    <div className="h-3 w-32 bg-white/5 rounded" />
                </div>
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 rounded-xl bg-white/5 border border-white/5" />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-96 rounded-3xl bg-white/5 border border-white/5" />
                <div className="h-96 rounded-3xl bg-white/5 border border-white/5" />
            </div>
        </div>
    );
}
