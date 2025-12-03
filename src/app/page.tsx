"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Globe, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle,
  Sparkles,
  Shield,
  Clock,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface CloudflareZone {
  id: string;
  name: string;
  status: string;
}

interface EmailRouting {
  id: string;
  zoneId: string;
  zoneName: string;
  aliasPart: string;
  fullEmail: string;
  ruleId: string;
  destination: string;
  isActive: boolean;
  createdAt: string;
}

const indonesianFirstNames = [
  "budi", "siti", "agus", "dewi", "eko", "rina", "fajar", "dian", "rizky", "nur",
  "andi", "maya", "hendra", "sari", "joko", "putri", "bayu", "fitri", "dimas", "angga",
  "wati", "bambang", "yuni", "doni", "indah", "reza", "kartika", "ahmad", "susanti", "pratama"
];

const indonesianLastNames = [
  "santoso", "pratama", "wijaya", "kusuma", "hidayat", "saputra", "wulandari", "nugroho",
  "siregar", "nasution", "putra", "dewi", "pertiwi", "permata", "cahyono", "rahman",
  "hakim", "fauzi", "subekti", "marlina", "handoko", "susilo", "fitriani", "rahmawati"
];

export default function EmailRoutingManager() {
  const [zones, setZones] = useState<CloudflareZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [emailList, setEmailList] = useState<EmailRouting[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [manualAlias, setManualAlias] = useState("");
  const [destinationEmail, setDestinationEmail] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load zones on mount
  useEffect(() => {
    loadZones();
    loadEmailList();
    
    // Check for dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const loadZones = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/cloudflare/zones');
      const data = await response.json();
      
      if (data.success) {
        setZones(data.zones);
        if (data.zones.length > 0) {
          setSelectedZone(data.zones[0].id);
        }
      } else {
        toast.error("Failed to load zones: " + data.error);
      }
    } catch (error) {
      toast.error("Failed to load zones");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailList = async () => {
    try {
      const response = await fetch('/api/email-routing');
      const data = await response.json();
      
      if (data.success) {
        setEmailList(data.emails);
      }
    } catch (error) {
      console.error("Failed to load email list:", error);
    }
  };

  const generateIndonesianName = () => {
    const firstName = indonesianFirstNames[Math.floor(Math.random() * indonesianFirstNames.length)];
    const lastName = indonesianLastNames[Math.floor(Math.random() * indonesianLastNames.length)];
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    return `${firstName}${lastName}${randomSuffix}`;
  };

  const createEmailRouting = async () => {
    if (!selectedZone || !destinationEmail) {
      toast.error("Please select a zone and destination email");
      return;
    }

    const aliasPart = isAutoMode ? generateIndonesianName() : manualAlias;
    if (!aliasPart) {
      toast.error("Please enter an alias");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/email-routing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zoneId: selectedZone,
          aliasPart,
          destinationEmail
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Email routing created successfully!");
        setManualAlias("");
        loadEmailList();
      } else {
        toast.error("Failed to create email routing: " + data.error);
      }
    } catch (error) {
      toast.error("Failed to create email routing");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEmailRouting = async (id: string, ruleId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/email-routing/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ruleId })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Email routing deleted successfully!");
        loadEmailList();
      } else {
        toast.error("Failed to delete email routing: " + data.error);
      }
    } catch (error) {
      toast.error("Failed to delete email routing");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const selectedZoneData = zones.find(z => z.id === selectedZone);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300`}>
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Email Routing Manager</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">Kelola alamat email Cloudflare Anda dengan mudah</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="ml-4"
            >
              {darkMode ? "☀️" : "🌙"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create Email Routing Card */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-slate-900 dark:text-white">Buat Email Routing Baru</CardTitle>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Buat alamat email baru yang diteruskan ke email tujuan Anda
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Zone Selection */}
                <div className="space-y-2">
                  <Label htmlFor="zone" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Domain
                  </Label>
                  <Select value={selectedZone} onValueChange={setSelectedZone} disabled={isLoading}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih domain..." />
                    </SelectTrigger>
                    <SelectContent>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Email Mode Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Mode Pembuatan Email
                    </Label>
                    <Switch
                      checked={isAutoMode}
                      onCheckedChange={setIsAutoMode}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                    {isAutoMode ? (
                      <>
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span>Otomatis (Nama Indonesia + Random)</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-green-500" />
                        <span>Manual (Custom Alias)</span>
                      </>
                    )}
                  </div>

                  {isAutoMode ? (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Preview Nama Otomatis
                        </span>
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                        <p>• budisantoso8x9@{selectedZoneData?.name || 'domain.com'}</p>
                        <p>• sitipratama99a@{selectedZoneData?.name || 'domain.com'}</p>
                        <p>• aguswijaya2b3@{selectedZoneData?.name || 'domain.com'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="alias" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Alias Email
                      </Label>
                      <Input
                        id="alias"
                        type="text"
                        placeholder="contoh: support"
                        value={manualAlias}
                        onChange={(e) => setManualAlias(e.target.value)}
                        disabled={isLoading}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Destination Email */}
                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Tujuan
                  </Label>
                  <Input
                    id="destination"
                    type="email"
                    placeholder="email@example.com"
                    value={destinationEmail}
                    onChange={(e) => setDestinationEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <Button 
                  onClick={createEmailRouting} 
                  disabled={isLoading || !selectedZone || !destinationEmail}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Buat Email Routing
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Email List */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-5 h-5 text-green-500" />
                    <CardTitle className="text-slate-900 dark:text-white">Daftar Email Routing</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadEmailList}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Kelola semua alamat email routing yang telah dibuat
                </CardDescription>
              </CardHeader>
              <CardContent>
                {emailList.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">Belum ada email routing yang dibuat</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {emailList.map((email) => (
                      <div
                        key={email.id}
                        className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-slate-900 dark:text-white">
                                {email.fullEmail}
                              </h3>
                              <Badge variant={email.isActive ? "default" : "secondary"}>
                                {email.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                              → {email.destination}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center space-x-1">
                                <Globe className="w-3 h-3" />
                                <span>{email.zoneName}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(email.createdAt).toLocaleDateString('id-ID')}</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(email.fullEmail, email.id)}
                            >
                              {copiedId === email.id ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteEmailRouting(email.id, email.ruleId)}
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Statistik</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Total Email</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {emailList.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Domain Aktif</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {zones.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Email Aktif</span>
                  <span className="text-2xl font-bold text-green-500">
                    {emailList.filter(e => e.isActive).length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={loadZones}
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Domains
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    setManualAlias(generateIndonesianName());
                    setIsAutoMode(false);
                  }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Random Name
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-slate-900 dark:text-white">Keamanan</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <p>• API Token disimpan dengan aman</p>
                  <p>• Tidak ada data yang di-hardcode</p>
                  <p>• Koneksi HTTPS terenkripsi</p>
                  <p>• Validasi input otomatis</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}