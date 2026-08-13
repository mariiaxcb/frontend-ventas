import { ChatStream } from "@/components/live/ChatStream";
import { ListaPostulantes } from "@/components/live/ListaPostulantes";

export default function LivePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">
        Monitor en tiempo real de TikTok Live
      </h1>
      <div className="grid h-[70vh] grid-cols-1 gap-4 lg:grid-cols-2">
        <ChatStream />
        <ListaPostulantes />
      </div>
    </div>
  );
}
