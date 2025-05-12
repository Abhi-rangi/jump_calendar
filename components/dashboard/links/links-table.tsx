"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import type { SchedulingLink } from "@prisma/client";

interface LinkWithUser extends SchedulingLink {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export function LinksTable() {
  const [links, setLinks] = useState<LinkWithUser[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: session } = useSession();

  const fetchLinks = async () => {
    try {
      const response = await fetch("/api/links");
      if (!response.ok) {
        throw new Error("Failed to fetch links");
      }
      const data = await response.json();
      setLinks(data);
    } catch (error) {
      console.error("Error fetching links:", error);
      toast({
        title: "Error",
        description: "Failed to load scheduling links.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const copyLink = async (link: LinkWithUser) => {
    const url = `${window.location.origin}/schedule/${link.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(link.id);
      toast({
        title: "Link copied",
        description: "Scheduling link has been copied to clipboard.",
      });
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.map((link) => (
            <TableRow key={link.id}>
              <TableCell>{link.name}</TableCell>
              <TableCell>{link.slug}</TableCell>
              <TableCell>{link.duration} minutes</TableCell>
              <TableCell>
                {format(new Date(link.createdAt), "MMM d, yyyy")}
              </TableCell>
              <TableCell>
                {link.expirationDate &&
                new Date(link.expirationDate) < new Date()
                  ? "Expired"
                  : "Active"}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyLink(link)}
                  title="Copy scheduling link"
                >
                  {copiedId === link.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {links.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No scheduling links found. Create your first link to get
                started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
