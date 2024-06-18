"use client";
import { Button } from "@/components/core/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { Textarea } from "@/components/core/textarea";
import { useToast } from "@/components/core/use-toast";
import { contactRequest } from "@/services/contact-service";
import { contactSchema } from "@/validation-schema/contact.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const ContactForm = () => {
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",

    defaultValues: {
      email: "",
      message: "",
      name: "",
    },
  });
  const { toast } = useToast();

  const onSubmit: SubmitHandler<z.infer<typeof contactSchema>> = async (
    data
  ) => {
    try {
      await contactRequest(data);

      form.setValue("name", "");
      form.setValue("email", "");
      form.setValue("message", "");
      toast({
        colorScheme: "success",
        description: "Message sent",
        duration: 2000,
      });
    } catch (err: any) {
      if (err.errors) {
        for (const error of err.errors) {
          if (error.field) {
            form.setError(error.field, { message: error.message });
          } else {
            toast({ colorScheme: "destructive", description: "Error" });
          }
        }
      }
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="mb-3">
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
            <FormItem className="mb-3">
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="mb-3">
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Enter your message here"
                  className="h-44 py-2"
                ></Textarea>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-4">
          <Button
            type="submit"
            className="w-full"
            isLoading={form.formState.isSubmitting}
            size="lg"
          >
            Send
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;
