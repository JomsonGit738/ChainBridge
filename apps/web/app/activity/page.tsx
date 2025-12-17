"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ChevronDown, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchActivity, mockActivity, type ActivityRow } from "@/lib/graphql";
import { formatHash, formatTimestamp } from "@/lib/utils";

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

export default function ActivityPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<ActivityRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [demoMode, setDemoMode] = useState(!endpoint);

  const load = async () => {
    if (!endpoint) {
      setRows(mockActivity);
      setDemoMode(true);
      setError(null);
      setDebug(null);
      return;
    }
    setLoading(true);
    setError(null);
    setDebug(null);
    try {
      const data = await fetchActivity(endpoint);
      setRows(data);
      setDemoMode(false);
    } catch (err: any) {
      setError("GraphQL request failed. Check NEXT_PUBLIC_GRAPHQL_ENDPOINT and query shape.");
      setDebug(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [endpoint]);

  const filtered = useMemo(() => {
    if (!query) return rows;
    return rows.filter((row) => {
      const needle = query.toLowerCase();
      return (
        row.id.toLowerCase().includes(needle) ||
        (row.txHash?.toLowerCase().includes(needle) ?? false) ||
        (row.timestamp ? formatTimestamp(row.timestamp).toLowerCase().includes(needle) : false)
      );
    });
  }, [rows, query]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-card">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <Badge variant="outline" className="border-emerald-300/50 text-emerald-100">
              Activity Feed
            </Badge>
            <h1 className="mt-2 text-3xl font-semibold text-white">GraphQL / Indexer view</h1>
            <p className="text-sm text-slate-300">
              Queries your GraphQL endpoint (or demo data) for the latest 20 entities with id, timestamp, tx hash.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden md:inline-flex">
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Counter
              </Link>
            </Button>
            <Input
              placeholder="Search by id / hash / time"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-white/5"
            />
            <Button variant="outline" onClick={load} disabled={loading}>
              {loading ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />} Refresh
            </Button>
          </div>
        </div>
        <Button asChild variant="outline" className="mt-3 w-full md:hidden">
          <Link href="/" className="flex items-center justify-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Counter
          </Link>
        </Button>
      </section>

      <Card className="card-surface">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Latest activity</span>
            {demoMode && <Badge variant="outline">Demo mode</Badge>}
          </CardTitle>
          <CardDescription>
            {demoMode ? "Demo data shown because NEXT_PUBLIC_GRAPHQL_ENDPOINT is not set." : `Endpoint: ${endpoint}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
              <p className="mt-1 text-rose-200">
                Set NEXT_PUBLIC_GRAPHQL_ENDPOINT in apps/web/.env.local and ensure the query in lib/graphql.ts matches
                your schema.
              </p>
              {debug && (
                <details className="mt-2 rounded-md bg-black/30 p-2">
                  <summary className="cursor-pointer text-xs text-rose-200">Debug details</summary>
                  <pre className="mt-1 whitespace-pre-wrap text-[11px] text-rose-100">{debug}</pre>
                </details>
              )}
            </div>
          )}

          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, idx) => (
                <Skeleton key={idx} className="h-12 w-full bg-white/5" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-white/5 bg-black/20 p-4 text-sm text-slate-200">
              No results. Adjust your search or ensure the endpoint returns data.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-white/5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Id</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Tx Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs text-indigo-100">{row.id}</TableCell>
                      <TableCell className="text-sm text-slate-200">{formatTimestamp(row.timestamp)}</TableCell>
                      <TableCell className="font-mono text-xs text-slate-200">
                        {row.txHash ? formatHash(row.txHash) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="rounded-lg border border-white/5 bg-black/30 p-3 text-xs text-slate-200">
            Query used (update to fit your subgraph):
            <details className="mt-1 flex items-center gap-2">
              <summary className="flex cursor-pointer items-center gap-1 text-indigo-200">
                <ChevronDown className="h-4 w-4" /> ACTIVITY_QUERY
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-[11px] text-slate-100">
{`query Activity {
  items: transfers(first: 20, orderBy: timestamp, orderDirection: desc) {
    id
    timestamp
    txHash
  }
}`}
              </pre>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
