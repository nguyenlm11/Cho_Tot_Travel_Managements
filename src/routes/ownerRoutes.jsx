import HomestayList from '../pages/owner/HomestayList';
import AddHomestay from '../pages/owner/AddHomestay';
import HomestayDetail from '../pages/owner/HomestayDetail';
import ServiceList from '../pages/owner/ServiceList';
import RoomTypeList from '../pages/owner/RoomTypeList';
import CustomerList from '../pages/owner/CustomerList';
import RatingList from '../pages/owner/RatingList';

export const ownerRoutes = [
  {
    path: 'homestays',
    element: <HomestayList />
  },
  {
    path: 'homestays/add',
    element: <AddHomestay />
  },
  {
    path: 'homestays/:id/info',
    element: <HomestayDetail />,
  },
  {
    path: 'homestays/:id/services',
    element: <ServiceList />
  },
  {
    path: 'homestays/:id/room-types',
    element: <RoomTypeList />
  },
  {
    path: 'homestays/:id/customers',
    element: <CustomerList />
  },
  {
    path: 'homestays/:id/ratings',
    element: <RatingList />
  }
]; 