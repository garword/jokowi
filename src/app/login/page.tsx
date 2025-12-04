"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { Language, t } from "@/lib/translations";
import { LanguageSelector } from "@/components/language-selector";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<Language>("id");
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
    
    // Load language preference
    const savedLang = localStorage.getItem("language") as Language;
    if (savedLang) {
      setLanguage(savedLang);
    }
    
    // Check if user was remembered before
    const savedUsername = localStorage.getItem("remembered_username");
    const wasRemembered = localStorage.getItem("remember_me") === "true";
    
    if (savedUsername && wasRemembered) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, [isAuthenticated, router]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = login(username, password, rememberMe);
      
      if (success) {
        toast.success(t("Login berhasil!", language));
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        setError(t("Username atau password salah", language));
        toast.error(t("Username atau password salah", language));
      }
    } catch (error) {
      setError("An error occurred during login");
      toast.error("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <LanguageSelector 
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t("Email Routing Manager Login", language)}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t("Silakan masuk untuk melanjutkan", language)}
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-slate-900 dark:text-white">
              {t("Login Required", language)}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {t("Silakan masuk untuk melanjutkan", language)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {t("Username", language)}
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t("Masukkan username", language)}
                  className="w-full"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  <Lock className="w-4 h-4 inline mr-2" />
                  {t("Password", language)}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("Masukkan password", language)}
                    className="w-full pr-10"
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="h-4 w-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <Label htmlFor="rememberMe" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("Remember me", language)}
                </Label>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="border-red-300 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t("Loading...", language)}</span>
                  </div>
                ) : (
                  t("Masuk", language)
                )}
              </Button>
            </form>

            {/* Hint */}
            <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                <strong>Hint:</strong> Use username "windaa" and password "cantik" to login
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Protected by authentication system
          </p>
        </div>
      </div>
    </div>
  );
}