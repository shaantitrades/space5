import { Converter } from '@/components/convert/converter';
import { BackButton } from '@/components/ui/back-button';

export default function ConvertPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <BackButton />
      </div>
      <Converter />
    </div>
  );
}
