import { Badge } from "@/components/ui/badge";

interface Props {
  status: 'processing' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'delayed';
}

export function ShipmentStatusBadge({ status }: Props) {
  const getStatusColor = (status: Props['status']) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'picked_up':
        return 'bg-purple-100 text-purple-800';
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: Props['status']) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Badge className={`${getStatusColor(status)} border-0`}>
      {formatStatus(status)}
    </Badge>
  );
}
