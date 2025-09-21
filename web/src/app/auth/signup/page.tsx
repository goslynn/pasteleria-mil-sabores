import { SignupForm } from "@/components/signup-form";
import { signup } from "@/app/auth/signup/actions";

export default function RegisterPage() {
    return (
        <main className="flex items-center justify-center min-h-screen p-4">
            <SignupForm action={signup}/>
        </main>
    );
}
