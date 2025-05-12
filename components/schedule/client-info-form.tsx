"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import type { SchedulingLink, User } from "@prisma/client";

interface CustomQuestion {
  id: string;
  text: string;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  linkedin: z.string().min(1, "LinkedIn profile is required"),
  notes: z.string().optional(),
  answers: z.record(z.string().min(1, "Answer is required")),
});

type FormValues = z.infer<typeof formSchema>;

interface ClientInfoFormProps {
  link: SchedulingLink & {
    user: Pick<User, "name" | "email" | "image">;
    customQuestions?: CustomQuestion[];
  };
  selectedDate: Date;
  selectedTime: string;
  onBack: () => void;
  onSubmit: () => void;
}

export function ClientInfoForm({
  link,
  selectedDate,
  selectedTime,
  onBack,
  onSubmit,
}: ClientInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      linkedin: "",
      notes: "",
      answers: {},
    },
  });

  const handleSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          linkId: link.id,
          date: selectedDate.toISOString(),
          time: selectedTime,
          attendee: {
            name: data.name,
            email: data.email,
            linkedin: data.linkedin,
          },
          notes: data.notes,
          answers: data.answers,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule meeting");
      }

      toast({
        title: "Success",
        description: "Your meeting has been scheduled.",
      });

      onSubmit();
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6 space-y-2">
        <Button variant="ghost" className="mb-2" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex flex-col gap-1 border-b pb-4">
          <h3 className="text-lg font-medium">{link.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-4 w-4" />
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-1 h-4 w-4" />
            {selectedTime}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://linkedin.com/in/your-profile"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide your LinkedIn profile URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes or context for the meeting"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {link.customQuestions && link.customQuestions.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="font-medium">Additional Information</h3>
                {link.customQuestions.map((question: CustomQuestion) => (
                <FormField
                  key={question.id}
                  control={form.control}
                  name={`answers.${question.id}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{question.text}</FormLabel>
                      <FormControl>
                          <Textarea
                            placeholder="Your answer"
                            className="min-h-[80px]"
                            {...field}
                          />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
