import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Credits() {
  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-lg shadow-xl rounded-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-bold">
            Credits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Developed by{" "}
              <a
                href="https://github.com/AbidAlWassie"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-gray-800"
              >
                Abid Al Wassie
              </a>
              .
            </p>
            <p className="text-center text-gray-600">
              Special thanks to the open-source community for their support and
              contributions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
