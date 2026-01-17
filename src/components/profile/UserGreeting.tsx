import { getUserProfile } from '@/app/actions/user-actions';
import { AvatarUpload } from '@/components/profile/AvatarUpload';

export async function UserGreeting() {
    const profile = await getUserProfile();

    // Determinar saudação baseada na hora
    const hour = new Date().getHours();
    let greeting = 'Olá';
    if (hour >= 5 && hour < 12) greeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
    else greeting = 'Boa noite';

    return (
        <div className="flex items-center gap-3">
            <AvatarUpload
                currentAvatar={profile.avatarUrl}
                userName={profile.name}
            />
            <div className="hidden sm:block">
                <p className="text-sm text-slate-400">{greeting},</p>
                <p className="font-semibold text-white">{profile.name}</p>
            </div>
        </div>
    );
}
