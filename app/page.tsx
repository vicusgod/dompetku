'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import Image from "next/image";

export default function Home() {
  const { loginAsGuest, isLoading } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing-bg.png"
          alt="Dompetku Background"
          fill
          priority
          className="object-cover object-center"
          quality={100}
          unoptimized
        />
        {/* Soft overlay to ensure readability */}
        <div className="absolute inset-0 bg-blue-900/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        <Card className="border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-4xl font-bold tracking-tight text-blue-950">dompetku</CardTitle>
            <CardDescription className="text-blue-900/80 text-lg font-medium">
              Manage your finances with ease.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pt-4">
            <p className="text-center text-sm leading-relaxed text-blue-900/70">
              Track your expenses, manage categories, and visualize your spending habits in a beautiful, intuitive interface.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="outline" asChild size="lg" className="w-full border-blue-200 bg-white/50 text-blue-800 hover:bg-white/80 hover:text-blue-900 transition-all">
                <Link href="/signup">Sign Up</Link>
              </Button>

              {/* Guest Mode Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-blue-200/60" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-medium tracking-wider">
                  <span className="bg-transparent px-2 text-blue-400">or</span>
                </div>
              </div>

              {/* Guest Mode Button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600/80 hover:text-blue-800 hover:bg-blue-100/30"
                onClick={loginAsGuest}
                disabled={isLoading}
              >
                Continue as Guest
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Text */}
        <p className="mt-8 text-center text-xs text-white/60 font-medium drop-shadow-md">
          © {new Date().getFullYear()} dompetku
        </p>
      </div>
    </div>
  );
}
