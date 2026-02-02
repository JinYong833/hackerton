import { Link } from 'react-router-dom';
import { Button, Card, CardContent } from '@/shared/ui';
import { useJobsList, JobCard, JobStatus } from '@/entities/job';
import { Upload, ArrowRight, FileAudio, Zap, Brain, MessageSquare } from 'lucide-react';

export const HomePage = () => {
  const { data: jobs } = useJobsList();
  const recentJobs = jobs?.slice(0, 3) || [];
  const hasRecentJobs = recentJobs.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Learn Smarter from
          <span className="text-blue-600"> Audio Content</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Upload your lectures, seminars, or meetings. Get transcripts, summaries, key
          points, and interactive quizzes to accelerate your learning.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/upload">
            <Button size="lg" className="w-full sm:w-auto">
              <Upload className="h-5 w-5 mr-2" />
              Upload Audio
            </Button>
          </Link>
          {hasRecentJobs && (
            <Link to="/history">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View History
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              icon: FileAudio,
              title: 'Upload Audio',
              description: 'Upload lectures, meetings, or any audio content up to 500MB.',
            },
            {
              icon: Zap,
              title: 'AI Processing',
              description:
                'Our AI transcribes and analyzes your content in minutes.',
            },
            {
              icon: Brain,
              title: 'Smart Summaries',
              description:
                'Get TL;DR, key points, and structured outlines instantly.',
            },
            {
              icon: MessageSquare,
              title: 'Interactive Quiz',
              description: 'Test your understanding with auto-generated quizzes.',
            },
          ].map((feature, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="inline-flex p-3 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Jobs Section */}
      {hasRecentJobs && (
        <section className="py-12 border-t border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Sessions</h2>
            <Link to="/history" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {recentJobs.map((job) => (
              <Link
                key={job.job_id}
                to={
                  job.status === JobStatus.DONE
                    ? `/study-room/${job.job_id}`
                    : `/jobs/${job.job_id}/status`
                }
              >
                <JobCard job={job} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 border-t border-gray-200">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 border-none">
          <CardContent className="p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Ready to Supercharge Your Learning?
            </h2>
            <p className="text-blue-100 mb-6 max-w-xl mx-auto">
              Start by uploading your first audio file. It only takes a few minutes to
              transform hours of content into actionable knowledge.
            </p>
            <Link to="/upload">
              <Button variant="secondary" size="lg">
                Get Started Free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
