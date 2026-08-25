import { LayoutGrid, Sparkles } from 'lucide-react';
import { features } from '../constants/features.constants';

export function PageContent() {
  return (
    <main className="bg-background min-h-auto flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl text-center">
        <div className="bg-brand text-brand-foreground mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl">
          <LayoutGrid className="size-8" aria-hidden="true" />
        </div>

        <h1 className="text-foreground text-balance text-2xl font-semibold sm:text-3xl">
          Welcome to Linler
        </h1>

        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-pretty leading-relaxed">
          Select or create a workspace, as you won&apos;t be able to use the
          app&apos;s features without it. As an owner or administrator, you can
          create a project and invite participants to it, or join other projects
          to participate in their processes.
        </p>

        <ul className="mt-12 grid gap-4 text-left sm:grid-cols-3">
          {features.map((feature) => (
            <li
              key={feature.title}
              className="border-border bg-card hover:border-brand/40 rounded-xl border p-4 transition-colors"
            >
              <div className="bg-secondary text-foreground mb-3 flex size-9 items-center justify-center rounded-lg">
                <feature.icon className="size-4.5" aria-hidden="true" />
              </div>
              <h2 className="text-card-foreground text-sm font-medium">
                {feature.title}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>

        <p className="text-muted-foreground mt-10 inline-flex items-center gap-1.5 text-xs">
          <Sparkles className="size-3.5" aria-hidden="true" />
          Create projects and collaborate on them with your team
        </p>
      </div>
    </main>
  );
}
