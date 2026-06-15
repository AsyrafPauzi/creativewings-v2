import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: Props) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This feature is part of the Creative Wings roadmap and will ship in an upcoming
            release. Reach out if you&apos;d like to prioritise it.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
