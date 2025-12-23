'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/actions/auth';
import Link from 'next/link';
import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface LoginState {
    error?: string;
    message?: string;
}

const initialState: LoginState = {
    error: '',
    message: '',
};

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(async (_prev: LoginState, formData: FormData) => {
        const result = await login(formData);
        return (result as LoginState) || {};
    }, initialState);

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
                {/* Soft overlay */}
                <div className="absolute inset-0 bg-blue-900/20" />
            </div>

            <div className="relative z-10 w-full max-w-sm px-4">
                <Card className="border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-3xl font-bold tracking-tight text-blue-950">Login</CardTitle>
                        <CardDescription className="text-blue-900/80">
                            Enter your email below to login to your account
                        </CardDescription>
                    </CardHeader>
                    <form action={formAction} className="flex flex-col gap-6">
                        <CardContent className="grid gap-4 pt-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-blue-900">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className="bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-blue-900">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="bg-white/50 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            {state?.error && (
                                <p className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded border border-red-100 text-center">{state.error}</p>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]" type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sign in
                            </Button>
                            <div className="text-center text-sm text-blue-900/80">
                                Don&apos;t have an account?{' '}
                                <Link href="/signup" className="font-semibold text-blue-700 underline hover:text-blue-900">
                                    Sign up
                                </Link>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
                {/* Footer Text */}
                <p className="mt-8 text-center text-xs text-white/60 font-medium drop-shadow-md">
                    © {new Date().getFullYear()} dompetku
                </p>
            </div>
        </div>
    );
}
