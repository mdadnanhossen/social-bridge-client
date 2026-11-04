"use client";

import { useState, type FormEvent } from "react";
import { Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Newsletter signup. Displays an inline confirmation message instead of
 * using alert(). No real subscription happens at this stage.
 */
export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Basic email check before showing the (mock) success state.
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return;
    }

    setSubscribed(true);
    setEmail("");
  }

  return (
    <section aria-labelledby="newsletter-heading" className="bg-brand-50/60 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5 sm:p-12">
          <h2
            id="newsletter-heading"
            className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl"
          >
            Stay Connected With SocialBridge
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Get updates about upcoming charity events and opportunities to help.
          </p>

          {subscribed ? (
            <div
              role="status"
              className="mx-auto mt-8 flex w-fit items-center gap-3 rounded-full bg-brand-50 px-6 py-3 text-sm font-medium text-brand-800 ring-1 ring-brand-100"
            >
              <span className="grid size-6 place-items-center rounded-full bg-brand-800 text-white">
                <Check className="size-3.5" aria-hidden="true" />
              </span>
              Thank you! You are on the list — watch your inbox for updates.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                required
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 flex-1 rounded-full border-border bg-background px-5"
                autoComplete="email"
              />
              <Button
                type="submit"
                className="h-12 rounded-full px-7 font-semibold"
              >
                <Send className="size-4" aria-hidden="true" />
                Subscribe
              </Button>
            </form>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;
