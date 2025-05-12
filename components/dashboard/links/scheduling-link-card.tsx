"use client"

import { Copy, Eye, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface SchedulingLinkCardProps {
  link: {
    id: string
    name: string
    slug: string
    duration: number
    maxAdvanceDays: number
    maxUses: number | null
    expirationDate: string | null
    createdAt: string
    customQuestions: Array<{ id: string; text: string }>
  }
}

export function SchedulingLinkCard({ link }: SchedulingLinkCardProps) {
  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/schedule/${link.slug}`)
    toast({
      title: "Link copied",
      description: "Scheduling link copied to clipboard",
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{link.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/links/${link.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/schedule/${link.slug}`} target="_blank">
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Preview</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={copyLink}>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy link</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="flex items-center gap-2">
          {link.duration} min
          <Badge variant="outline" className="ml-2">
            {link.customQuestions.length} questions
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <p className="text-muted-foreground mb-1">
            <span className="font-medium text-foreground">Max advance:</span> {link.maxAdvanceDays} days
          </p>
          {link.maxUses && (
            <p className="text-muted-foreground mb-1">
              <span className="font-medium text-foreground">Max uses:</span> {link.maxUses}
            </p>
          )}
          {link.expirationDate && (
            <p className="text-muted-foreground mb-1">
              <span className="font-medium text-foreground">Expires:</span>{" "}
              {new Date(link.expirationDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button onClick={copyLink} variant="outline" size="sm" className="w-full gap-1">
          <Copy className="h-3.5 w-3.5" />
          Copy scheduling link
        </Button>
      </CardFooter>
    </Card>
  )
}
