"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

export function HubspotIntegration() {
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    // In a real app, this would trigger OAuth flow
    // For demo purposes, we'll simulate a successful connection
    setTimeout(() => {
      setIsConnected(true)
      toast({
        title: "Hubspot connected",
        description: "Your Hubspot account has been successfully connected.",
      })
    }, 1000)
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    toast({
      title: "Hubspot disconnected",
      description: "Your Hubspot account has been disconnected.",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hubspot CRM</CardTitle>
        <CardDescription>Connect to Hubspot to sync contact information</CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-green-100 p-2">
              <svg
                className="h-6 w-6 text-green-600"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Hubspot Connected</p>
              <p className="text-sm text-muted-foreground">Your Hubspot CRM is synced with AdvisorConnect</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-100 p-2">
              <svg className="h-6 w-6 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 17C10.9 17 10 16.1 10 15C10 13.9 10.9 13 12 13C13.1 13 14 13.9 14 15C14 16.1 13.1 17 12 17ZM9 8V6C9 4.34 10.34 3 12 3C13.66 3 15 4.34 15 6V8H9Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">Connect Hubspot</p>
              <p className="text-sm text-muted-foreground">Enhance scheduling with CRM contact information</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {isConnected ? (
          <Button variant="outline" onClick={handleDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button onClick={handleConnect}>Connect Hubspot</Button>
        )}
      </CardFooter>
    </Card>
  )
}
