'use client';

import { useRouter } from 'next/navigation';
import VantaBackground from '@/components/VantaBackground';

export default function Home() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  const handleSignUp = () => {
    router.push('/auth/signup');
  };

  return (
    <>
      <VantaBackground />
      
      {/* Animated Project Name */}
      <div className="project-name">
        <h1>Float Point</h1>
      </div>

      {/* Bottom Buttons */}
      <div className="index-buttons">
        <button className="index-btn" onClick={handleSignIn}>Sign in</button>
        <button className="index-btn" onClick={handleSignUp}>Sign up</button>
      </div>
    </>
  );
}
