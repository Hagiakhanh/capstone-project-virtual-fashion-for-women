import { Card } from "antd";

interface OutfitCardProps {
  name: string;
  imageUrl: string;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({ name, imageUrl }) => (
  <Card
    className="w-[280px] rounded-xl overflow-hidden bg-[#F9F6F0] shadow-lg hover:shadow-xl transition-shadow"
    cover={
      <img
        alt={name}
        src={imageUrl}
        className="h-[320px] object-cover w-full"
      />
    }
  >
    <Card.Meta description={<div className="text-center">{name}</div>} />
  </Card>
);
