import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudySession } from "@shared/schema";

export default function ActivityFeed() {
  const { data: sessions, isLoading } = useQuery<StudySession[]>({
    queryKey: ['/api/study/sessions', { limit: 5 }],
  });

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} gün önce`;
    } else if (diffHours > 0) {
      return `${diffHours} saat önce`;
    } else {
      return 'Az önce';
    }
  };

  const getActivityIcon = (session: StudySession) => {
    if (session.correctAnswers === session.totalAnswers) {
      return { icon: '✅', bg: 'bg-green-100', color: 'text-green-600' };
    } else if (session.correctAnswers / session.totalAnswers > 0.7) {
      return { icon: '🔥', bg: 'bg-orange-100', color: 'text-orange-600' };
    } else {
      return { icon: '📚', bg: 'bg-blue-100', color: 'text-blue-600' };
    }
  };

  const getActivityMessage = (session: StudySession) => {
    const accuracy = Math.round((session.correctAnswers / session.totalAnswers) * 100);
    return `${session.wordsStudied} kelime çalıştın (${accuracy}% doğru)`;
  };

  if (isLoading) {
    return (
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h2>
        <Card className="material-shadow">
          <CardContent className="p-6">
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Son Aktiviteler</h2>
      <Card className="material-shadow">
        <CardContent className="p-6">
          {!sessions || sessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Henüz aktivite bulunmuyor.</p>
              <p className="text-sm text-gray-400 mt-2">
                Kelime çalışmaya başladığınızda aktiviteleriniz burada görünecek.
              </p>
            </div>
          ) : (
            <div className="flow-root">
              <ul role="list" className="-mb-8">
                {sessions.map((session, index) => {
                  const activity = getActivityIcon(session);
                  return (
                    <li key={session.id}>
                      <div className="relative pb-8">
                        {index !== sessions.length - 1 && (
                          <span 
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                            aria-hidden="true"
                          />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full ${activity.bg} flex items-center justify-center ring-8 ring-white`}>
                              <span className={`${activity.color} text-sm`}>
                                {activity.icon}
                              </span>
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">
                                {getActivityMessage(session)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {session.duration} dakika çalışma
                              </p>
                            </div>
                            <div className="text-right text-xs text-gray-400 whitespace-nowrap">
                              {formatTimeAgo(session.date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
