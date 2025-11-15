import PersonDetail from "@/components/simulator/person-detail2";

type Props = { params: { id: string } };

export default function PersonPage({ params }: Props) {
  const { id } = params;

  return (
    // Render the client-side detail component and pass the id
    <div>
      <PersonDetail personId={id} />
    </div>
  );
}
