"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useForm, type UseFormReturn, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSession } from "next-auth/react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, X } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters."),
  duration: z.coerce.number().min(15, "Duration must be at least 15 minutes."),
  maxAdvanceDays: z.coerce.number().nullable(),
  hasMaxUses: z.boolean(),
  maxUses: z.coerce.number().nullable(),
  hasExpiration: z.boolean(),
  expirationDate: z.string().nullable(),
  customQuestions: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

type FormProps = {
  form: UseFormReturn<FormValues>;
  onSubmit: (data: FormValues) => Promise<void>;
};

function CreateLinkFormFields({ form, onSubmit }: FormProps) {
  const [questions, setQuestions] = useState<
    Array<{ id: string; text: string }>
  >([{ id: "1", text: "What would you like to discuss in our meeting?" }]);

  const addQuestion = () => {
    const newQuestions = [
      ...questions,
      { id: Date.now().toString(), text: "" },
    ];
    setQuestions(newQuestions);
    form.setValue("customQuestions", newQuestions);
  };

  const removeQuestion = (id: string) => {
    const newQuestions = questions.filter((q) => q.id !== id);
    setQuestions(newQuestions);
    form.setValue("customQuestions", newQuestions);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Initial Consultation" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your scheduling link.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link Slug</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="text-muted-foreground mr-2">
                        /schedule/
                      </span>
                      <Input placeholder="initial-consultation" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    The URL-friendly identifier for your link.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={15}
                      placeholder="30"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>
                    How long each meeting will last.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxAdvanceDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Advance Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="30"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormDescription>
                    How far in advance meetings can be scheduled.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasMaxUses"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Limit Total Uses
                    </FormLabel>
                    <FormDescription>
                      Limit how many times this link can be used.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("hasMaxUses") && (
              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Uses</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="10"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of meetings that can be scheduled.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="hasExpiration"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Set Expiration Date
                    </FormLabel>
                    <FormDescription>
                      Set a date when this link will expire.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("hasExpiration") && (
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>
                      The link will no longer work after this date.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custom Questions</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addQuestion}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => (
              <div key={question.id} className="flex items-start gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name={`customQuestions.${index}.text` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question {index + 1}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What would you like to discuss?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/links">Cancel</Link>
          </Button>
          <Button type="submit">Create Link</Button>
        </div>
      </form>
    </Form>
  );
}

export function CreateLinkForm() {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      duration: 30,
      maxAdvanceDays: 30,
      hasMaxUses: false,
      maxUses: null,
      hasExpiration: false,
      expirationDate: null,
      customQuestions: [
        { id: "1", text: "What would you like to discuss in our meeting?" },
      ],
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (!session?.user?.email) {
        toast({
          title: "Error",
          description: "You must be signed in to create scheduling links.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/links`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          duration: data.duration,
          maxAdvanceDays: data.maxAdvanceDays,
          maxUses: data.hasMaxUses ? data.maxUses : null,
          expirationDate:
            data.hasExpiration && data.expirationDate
              ? new Date(data.expirationDate).toISOString()
              : null,
          customQuestions: data.customQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || "Failed to create link"
        );
      }

      toast({
        title: "Success",
        description: "Your scheduling link has been created.",
      });

      router.push("/dashboard/links");
      router.refresh();
    } catch (error) {
      console.error("Error creating link:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create scheduling link",
        variant: "destructive",
      });
    }
  };

  return <CreateLinkFormFields form={form} onSubmit={onSubmit} />;
}
