import { useState, useRef } from "react";
import { Layout } from "@/components/layout/Layout";
import { useTheme } from "@/hooks/useSessionsDB";
import { exportData, importData } from "@/lib/sessionsStore";
import { Download, Upload, Moon, Sun, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { settings, toggleTheme, toggleAuras } = useTheme();
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sessions-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported successfully");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importData(content)) {
        toast.success("Data imported successfully");
        window.location.reload();
      } else {
        toast.error("Failed to import data. Invalid format.");
      }
    };
    reader.readAsText(file);
    setImporting(false);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <header className="mb-8 pt-8 lg:pt-0">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your Sessions experience</p>
        </header>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-display font-semibold mb-4">Appearance</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.theme === "dark" ? (
                    <Moon className="w-5 h-5 text-primary" />
                  ) : (
                    <Sun className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <p className="font-medium">Theme</p>
                    <p className="text-sm text-muted-foreground">
                      {settings.theme === "dark" ? "Dark mode" : "Light mode"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
                >
                  Switch to {settings.theme === "dark" ? "Light" : "Dark"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Aura Effects</p>
                    <p className="text-sm text-muted-foreground">
                      Animated gradient background
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleAuras}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.aurasEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.aurasEnabled ? "translate-x-6" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-display font-semibold mb-4">Data Management</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download your data as JSON
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm font-medium"
                >
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Import Data</p>
                    <p className="text-sm text-muted-foreground">
                      Restore from a backup file
                    </p>
                  </div>
                </div>
                {importing ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setImporting(false)}
                      className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm"
                    >
                      Cancel
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium"
                    >
                      Choose File
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setImporting(true)}
                    className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-sm font-medium"
                  >
                    Import
                  </button>
                )}
              </div>
            </div>

            {importing && (
              <div className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Warning</p>
                  <p className="text-sm text-muted-foreground">
                    Importing will replace all existing data. Make sure to export a backup first.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* About */}
          <div className="glass-panel p-6">
            <h2 className="text-xl font-display font-semibold mb-4">About</h2>
            <p className="text-muted-foreground text-sm">
              Sessions is a local-only music project manager. All your data is stored in your browser's localStorage and never leaves your device.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
