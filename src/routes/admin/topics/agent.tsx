import { createFileRoute } from '@tanstack/react-router';
import AgentTopicCreatorPage from '../../../app/admin/topics/agent/page';

export const Route = createFileRoute('/admin/topics/agent')({
  component: AgentTopicCreatorPage,
});