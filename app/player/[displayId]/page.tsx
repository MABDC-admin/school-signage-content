
'use client';

import DisplayPlayer from '@/components/player/DisplayPlayer';
import { useSearchParams } from 'next/navigation';

export default function PlayerPage({ params }: { params: { displayId: string } }) {
    const searchParams = useSearchParams();
    const secretKey = searchParams.get('key') || '';

    return <DisplayPlayer displayId={params.displayId} secretKey={secretKey} />;
}
