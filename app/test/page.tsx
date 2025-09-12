import { SessionManagerTest } from '@/components/test/SessionManagerTest';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 p-4">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Session Manager Integration Test
        </h1>
        <SessionManagerTest />
      </div>
    </div>
  );
}