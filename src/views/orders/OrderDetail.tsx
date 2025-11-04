// src/views/orders/OrderDetail.tsx //Solo de pruebas, probablemente se borre luego 
import { useParams } from 'react-router-dom';
export default function OrderDetail() {
  const { orderId } = useParams();
  return <div style={{ padding: 16 }}>Detalle de orden {orderId}</div>;
}
``