import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Chatbot from '@/components/chatbot';

export default function Home() {
  const bgImage = PlaceHolderImages.find(img => img.id === 'university-campus');

  return (
    <main className="relative min-h-screen w-full">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover"
          priority
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <Chatbot />
      </div>
    </main>
  );
}
