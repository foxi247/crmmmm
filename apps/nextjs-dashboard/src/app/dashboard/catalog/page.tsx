"use client";

import { useState } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";

export default function CatalogPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ total: number; errors: string[] } | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("merchantId", "REPLACE_WITH_MERCHANT_ID");

    const res = await fetch("/api/catalog/upload", { method: "POST", body: formData });
    const data = await res.json();
    setResult({ total: data.total ?? 0, errors: data.errors ?? [] });
    setUploading(false);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Product Catalog</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Upload an Excel or CSV file to import your product catalog.
        </p>
      </div>

      <form onSubmit={handleUpload} className="bg-card border border-border rounded-xl p-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-foreground">File (CSV or XLSX)</span>
          <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {file ? file.name : "Click to select or drag & drop"}
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={!file || uploading}
          className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Catalog"}
        </button>
      </form>

      {result && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">{result.total} products imported</span>
          </div>
          {result.errors.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {result.errors.length} warnings
              </p>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
