import axios from 'axios';
import dayjs from 'dayjs';
const API_URL = 'http://localhost:3000';
//////////// ////////////////Auth APIs/////////////////////////////////////////////////////////////////////
export const getUserByEmail = async (email) => {
  try {
    const response = await axios.get(`${API_URL}/users?email=${email}`);
    return response.data[0];
  } catch (error) {
    throw new Error('خطا در دریافت اطلاعات کاربر',error);
  }
};
export const updateUserLogin = async (userId, loginData) => {
  try {
    const response = await axios.patch(`${API_URL}/users/${userId}`, {
      ...loginData,
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    throw new Error('خطا در به‌روزرسانی اطلاعات ورود',error);
  }
};
///////////////////////////////////////Users APIs//////////////////////////////////////////////////////////////////
export const fetchUsers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users`);
        return response.data;
    } catch (error) {
        throw new Error('خطا در دریافت لیست کاربران',error);
    }
};

export const createUser = async (userData) => {
    try {
        const data = {
            ...userData,
            id: `u${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            lastLogin: null,
            status: 'active'
        };
        const response = await axios.post(`${API_URL}/users`, data);
        return response.data;
    } catch (error) {
        throw new Error('خطا در ایجاد کاربر',error);
    }
};

// 
export const updateUser = async (userId, userData) => {
  try {
    console.log('updateUser called with:', { userId, userData });

    if (!userId) {
      throw new Error('شناسه کاربر نامعتبر است');
    }

    if (!userData || typeof userData !== 'object') {
      throw new Error('داده‌های کاربر نامعتبر است');
    }

    // فقط فیلدهای ارسالی رو آپدیت می‌کنیم, به علاوه updatedAt
    const data = {
      ...userData, // شامل firstName, lastName, profilePicture و هر فیلد دیگه
      updatedAt: new Date().toISOString(),
    };

    console.log('Sending data to API:', data);

    const response = await axios.patch(`${API_URL}/users/${userId}`, data);
    console.log('API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Update User Error:', {
      message: error.message,
      response: error.response ? { status: error.response.status, data: error.response.data } : 'No response',
    });
    throw new Error('خطا در به‌روزرسانی کاربر: ' + error.message);
  }
};
//
export const getUserById = async (id) => {
  try {
    console.log('Fetching user with ID:', id);
    const response = await axios.get(`${API_URL}/users/${id}`);
    console.log('User data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', {
      message: error.message,
      response: error.response ? { status: error.response.status, data: error.response.data } : 'No response',
    });
    throw new Error('خطا در دریافت اطلاعات کاربر: ' + error.message);
  }
};
//حذف کاربر از دیتابیس
export const deleteUser = async (userId) => {
  try {
    // استفاده از متد DELETE برای حذف کامل کاربر از دیتابیس
    await axios.delete(`${API_URL}/users/${userId}`);
    return true;
  } catch (error) {
    throw new Error('خطا در حذف کاربر',error);
  }
};
//ویرایش پروفایل کاربر در دیتابیس
export const updateUserProfile = async ({ userId, formData }) => {
  try {
    // تبدیل FormData به آبجکت
    const updateData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone')
    };

    // اگر تصویر جدید آپلود شده
    const newImage = formData.get('avatar');
    if (newImage) {
      const imageUrl = await handleImageUpload(newImage);
      updateData.profileImage = imageUrl;
    }
    // ارسال درخواست به سرور
    const response = await axios.patch(`${API_URL}/users/${userId}`, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw new Error('خطا در به‌روزرسانی پروفایل');
  }
};

// تابع کمکی برای آپلود تصویر
const handleImageUpload = async (file) => {
  try {
    // در حالت واقعی، اینجا باید تصویر به سرور آپلود شود
    // برای تست، یک URL موقت برمی‌گردانیم
    return URL.createObjectURL(file);
  } catch (error) {
    throw new Error('خطا در آپلود تصویر',error);
  }
};

//////////////////////////hotell API/////////////////////////////////////////////////////////////////
//دریافت هتل های موجو در دیتابیس
export const fetchHotels = async () => {
  try {
    const response = await axios.get(`${API_URL}/hotels`);
    
    const normalizedHotels = response.data.map(hotel => {
      // ترکیب و نرمال‌سازی همه امکانات
      const facilities = [
        ...(hotel.facilities || []),
        ...(hotel.amenities?.general || []),
        ...(hotel.amenities?.wellness || []),
        ...(hotel.amenities?.dining || [])
      ].map(f => f.toLowerCase().trim());

      const price = hotel.price || hotel.priceRange?.min || 0;

      return {
        ...hotel,
        facilities: [...new Set(facilities)],
        price, // فیلد اصلی قیمت
        basePrice: price, // ✅ اضافه شده برای هماهنگی با جدول مقایسه
        image: hotel.image || hotel.content?.images?.[0]?.data || '',
        rating: hotel.rating || 0,
        location: {
          city: hotel?.location?.address?.city || hotel?.location?.city || '',
          address: hotel?.location?.address?.full || hotel?.location?.address || ''
        },
        category: hotel.category || 'villa',
        status: hotel.status || 'active'
      };
    });
    return normalizedHotels;
  }
  catch(error){
    console.error('Error fetching hotels:', error);
    throw new Error('خطا در دریافت لیست هتل‌ها');
  }
};
//ویرایش اطلاعات هتل در دیتابیس
export const updateHotel = async (hotelId, hotelData) => {
  try {
    console.log('Update hotel called with ID:', hotelId, 'and data:', hotelData);
    if (!hotelId) {
      throw new Error('شناسه هتل نامعتبر است');
    }
    // اطمینان از وجود قیمت در داده‌ها
    const data = {
      ...hotelData,
      price: hotelData.price || 0,
      priceRange: {
        min: hotelData.price || 0,
        max: hotelData.price * 1.2 || 0 // 20% بیشتر از قیمت اصلی
      },
      updatedAt: new Date().toISOString()
    };
    const response = await axios.patch(`${API_URL}/hotels/${hotelId}`, data);
    console.log('Update response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Update Hotel Error:');
    throw error.response?.data?.message || error.message || 'خطا در به‌روزرسانی هتل';
  }
};
//ایجاد یک هتل جدید در دیتابیس
export const createHotel = async (hotelData) => {
  try {
    const data = {
      ...hotelData,
      id: `h${Date.now()}`,
      price: hotelData.price || 0,
      priceRange: {
        min: hotelData.price || 0,
        max: hotelData.price * 1.2 || 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    };
    const response = await axios.post(`${API_URL}/hotels`, data);
    return response.data;
  } catch (error) {
    throw new Error('خطا در ایجاد هتل',error);
  }
};
//دریافت اطلاعات یک هتل مورد نظر از دیتابیس
export const fetchHotelDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/hotels/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    throw new Error('خطا در دریافت جزئیات هتل');
  }
};
//حذف یک هتل از دیتابیس
export const deleteHotel = async (hotelId) => {
  try {
    const response = await axios.delete(`${API_URL}/hotels/${hotelId}`);
    return response.data;
  } catch (error) {
    console.error('Delete Hotel Error:', error);
    throw new Error('خطا در حذف هتل');
  }
};
/////////////////////////////////////////Reservtions API//////////////////////////////////////////////////////
//دریافت رزروهای ثبت شده در دیتابیس
export const fetchReservations = async () => {
  try {
    // Get all reservations, users, and hotels in parallel
    const [reservationsRes, usersRes, hotelsRes] = await Promise.all([
      axios.get(`${API_URL}/reservations`),
      axios.get(`${API_URL}/users`),
      axios.get(`${API_URL}/hotels`)
    ]);
    // Create maps for quick lookup
    const usersMap = new Map(usersRes.data.map(user => [user.id, user]));
    const hotelsMap = new Map(hotelsRes.data.map(hotel => [hotel.id, hotel]));
    // Format each reservation with complete data
    const formattedReservations = reservationsRes.data.map(reservation => {
      const user = usersMap.get(reservation.userId) || {};
      const hotel = hotelsMap.get(reservation.hotelId) || {};
      // استخراج قیمت از هتل یا رزرو
      const amount = reservation.amount || hotel.price || 0;
      return {
        id: reservation.id,
        hotelName: reservation.hotelName || hotel.name || '',
        user: {
          id: user.id || null,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || ''
        },
        hotel: {
          id: hotel.id || null,
          name: hotel.name || reservation.hotelName || '',
          location: hotel.location || {}
        },
        checkIn: reservation.checkIn || '',
        checkOut: reservation.checkOut || '',
        guests: {
          adults: reservation.guests?.adults || 1,
          children: reservation.guests?.children || 0
        },
        amount: amount, // قیمت
        status: reservation.status || 'pending',
        paymentStatus: reservation.paymentStatus || 'pending',
        createdAt: reservation.createdAt || '',
        notes: reservation.notes || ''
      };
    });
    return formattedReservations;
  } catch (error) {
    console.error('Error in fetchReservations:', error);
    throw new Error('خطا در دریافت رزروها');
  }
};
//دریافت اطلاعات رزرو یک هتل خاص
export const fetchHotelReservations = async (hotelId) => {
  try {
    if (!hotelId) throw new Error('شناسه هتل نامعتبر است');
    const response = await axios.get(`${API_URL}/reservations?hotelId=${hotelId}`);
    console.log('Hotel reservations fetched:', response.data); // برای دیباگ
    // فقط رزروهای غیرلغوشده (بر اساس status.booking)
    const activeReservations = response.data.filter(res => res.status?.booking !== 'canceled');
    return activeReservations;
  } catch (error) {
    console.error('Error fetching hotel reservations:', {
      message: error.message,
      response: error.response ? { status: error.response.status, data: error.response.data } : 'No response',
    });
    throw new Error('خطا در دریافت رزروهای هتل: ' + error.message);
  }
};
// دریافت اطلاعات یک رزرو با ایدی آن
export const fetchReservationById = async (reservationId) => {
  try {
    if (!reservationId) throw new Error('شناسه رزرو الزامی است');
    const response = await axios.get(`${API_URL}/reservations/${reservationId}`);
    console.log('Reservation fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('Fetch Reservation Error:', error.response?.data || error.message);
    throw new Error('خطا در دریافت اطلاعات رزرو');
  }
};
//دریافت رزروهای یک یوزر خاص
export const fetchUserReservations = async (userId) => {
  try {
    if (!userId) {
      throw new Error('شناسه کاربر نامعتبر است');
    }
    const response = await axios.get(`${API_URL}/reservations`);
    const allReservations = Array.isArray(response.data) ? response.data : [];
    // فیلتر کردن رزروهای مربوط به کاربر جاری
    const userReservations = allReservations.filter(
      reservation => reservation.userId === userId
    );
    return userReservations;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw new Error('خطا در دریافت رزروهای کاربر');
  }
};
///ایجاد یک رزرو
export const createReservation = async (reservationData) => {
  try {
    // چک وجود hotelId
    if (!reservationData.hotelId) throw new Error('شناسه هتل الزامی است');
    // لود رزروهای موجود برای هتل
    const existingReservations = await fetchHotelReservations(reservationData.hotelId);
    // چک تداخل تاریخ‌ها
    const newCheckIn = dayjs(reservationData.checkIn);
    const newCheckOut = dayjs(reservationData.checkOut);
    const hasConflict = existingReservations.some(res => {
      const resCheckIn = dayjs(res.checkIn);
      const resCheckOut = dayjs(res.checkOut);
      return (
        newCheckIn.isBefore(resCheckOut, 'day') &&
        newCheckOut.isAfter(resCheckIn, 'day')
      );
    });
    if (hasConflict) {
      throw new Error('تاریخ‌های انتخاب‌شده با رزروهای موجود تداخل دارند');
    }
    const data = {
      ...reservationData,
      id: `r${Date.now()}`,
      status: {
        booking: 'pending',
        checkIn: 'pending',
        checkOut: 'pending',
      },
      hotelName: reservationData.hotelName || '',
      guests: {
        adults: reservationData.guests?.adults || 1,
        children: reservationData.guests?.children || 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const response = await axios.post(`${API_URL}/reservations`, data);
    // ایجاد نوتیفیکیشن برای ادمین‌ها
    const admins = await fetchAdmins();
    const notificationPromises = admins.map(admin => {
      const notificationData = {
        userId: admin.id,
        type: 'new_reservation',
        title: 'رزرو جدید',
        message: `کاربر ${reservationData.userEmail || 'ناشناس'} هتل ${reservationData.hotelName || 'نامشخص'} را رزرو کرد. شماره رزرو: ${data.id}`,
        data: {
          reservationId: data.id,
          bookingNumber: data.id,
          hotelName: reservationData.hotelName || 'نامشخص',
          userEmail: reservationData.userEmail || 'ناشناس',
        },
        priority: 'medium',
      };
      return createNotification(notificationData);
    });
    await Promise.all(notificationPromises);
    return response.data;
  } catch (error) {
    console.error('Error creating reservation:', {
      message: error.message,
      response: error.response ? { status: error.response.status, data: error.response.data } : 'No response',
    });
    throw new Error(error.message || 'خطا در ایجاد رزرو');
  }
};

//// آپدیت کامل یک رزرو برای فرم ها
export const updateReservation = async (reservationData) => {
  try {
    const response = await axios.patch(`${API_URL}/reservations/${reservationData.id}`, reservationData);
    return response.data;
  } catch (error) {
    throw new Error('Error updating reservation',error);
  }
};
//

//////حذف یک رزرو
export const deleteReservation = async (reservationId) => {
  try {
    await axios.delete(`${API_URL}/reservations/${reservationId}`);
    return true;
  } catch (error) {
    throw new Error('Error deleting reservation',error);
  }
};
// ...
// Rooms APIs
export const fetchRooms = async (hotelId = null) => {
  try {
    const params = {};
    
    if (hotelId) {
      params.hotelId = hotelId;
      params.status = 'available';
    }
    const response = await axios.get(`${API_URL}/rooms`, { params });
    return response.data.map(room => ({
      id: room.id,
      name: room.name || `اتاق ${room.number}`,
      price: room.price || 0,
      capacity: {
        adults: room.capacity?.adults || 2,
        children: room.capacity?.children || 1
      },
      status: room.status || 'available',
      amenities: room.amenities || [],
      description: room.description || ''
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw new Error('خطا در دریافت اطلاعات اتاق‌ها');
  }
};
// دریافت اتاق‌های یک هتل خاص با قیمت و وضعیت
export const fetchRoomsByHotel = async (hotelId) => {
  try {
    const response = await axios.get(`${API_URL}/rooms`, {
      params: {
        hotelId,
        status: 'available',
        _sort: 'price',
        _order: 'asc'
      }
    });

    // اطمینان از داشتن ساختار درست داده‌ها
    return response.data.map(room => ({
      id: room.id,
      name: room.name || `اتاق ${room.number}`,
      price: room.price || 0,
      capacity: {
        adults: room.capacity?.adults || 2,
        children: room.capacity?.children || 1
      },
      status: room.status || 'available',
      amenities: room.amenities || [],
      description: room.description || ''
    }));
  } catch (error) {
    throw new Error('خطا در دریافت اطلاعات اتاق‌ها',error);
  }
};

////////یک تابع برای همه اپدیت های وضعیت

export const updateReservationStatus = async (id, updates) => {
  try {
    const response = await axios.patch(`${API_URL}/reservations/${id}`, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    throw new Error('خطا در به‌روزرسانی رزرو',error);
  }
};
//////Rom API

//ایجاد یک اتاق 
export const createRoom = async (roomData) => {
  try {
    const data = {
      ...roomData,
      id: `rm${Date.now()}`,
      hotelId: roomData.hotelId,
      status: roomData.status ? "available" : "unavailable",
      price: roomData.price,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const response = await axios.post(`${API_URL}/rooms`, data);
    return response.data;
  } catch (error) {
    throw new Error("خطا در ایجاد اتاق",error);
  }
};

//
export const updateRoom = async (roomId, roomData) => {
    try {
        const response = await axios.patch(`${API_URL}/rooms/${roomId}`, {
            ...roomData,
            updatedAt: new Date().toISOString()
        });
        return response.data;
    } catch (error) {
        throw new Error('خطا در به‌روزرسانی اتاق',error);
    }
};
//
export const deleteRoom = async (roomId) => {
    try {
        await axios.patch(`${API_URL}/rooms/${roomId}`, {
            status: 'deleted',
            deletedAt: new Date().toISOString()
        });
        return true;
    } catch (error) {
        throw new Error('خطا در حذف اتاق',error);
    }
};

///////////////////////////////////////////////////////// Favorites APIs////////////////////////////////////////
export const toggleFavorite = async (userId, hotelId) => {
    try {
        const response = await axios.patch(`${API_URL}/favorites`, { 
            userId, 
            hotelId 
        });
        return response.data;
    } catch (error) {
        throw new Error('خطا در تغییر علاقه‌مندی',error);
    }
};

export const fetchFavoriteHotels = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/favorites`, {
            params: { userId },
        });
        return response.data;
    } catch (error) {
        throw new Error('خطا در دریافت لیست هتل‌های علاقه‌مندی',error);
    }
};

// /Fetch Transactions
export const fetchTransactions = async (userId) => {
    try {
        const response = await axios.get(`${API_URL}/transactions?userId=${userId}`);
        return response.data;
    } catch (error) {
        throw new Error('خطا در دریافت تراکنش‌ها',error);
    }
};
/////////////////////////////////Notifications Api//////////////////////////////////////////////////////////
// Fetch Notifications //تابع دریافت نوتیفیکیشن ها از دیتابیس
export const fetchNotifications = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, {
      params: {
        userId,
        status: "unread",
        deletedAt_null: true,
        _sort: "createdAt",
        _order: "desc",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("خطا در دریافت نوتیفیکیشن‌ها", error);
  }
};
// Create Notification برای ایجادیه نوتیفیکیشن جدید تو  نوتیفیکیشن در دیتابیس
//وقتی کاربر رزرو ثبت می‌کنه, این تابع نوتیفیکیشن رو برای ادمینها می‌سازه.
export const createNotification = async (notificationData) => {
  try {
    const data = {
      ...notificationData,
      id: `n${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'unread',
      readAt: null,
      deletedAt: null,
    };
    const response = await axios.post(`${API_URL}/notifications`, data);
    return response.data;
  } catch (error) {
    throw new Error('خطا در ایجاد نوتیفیکیشن', error);
  }
};
// Mark Notification as Read
export const markNotificationAsRead = async (notificationId) => {
  try {
    console.log('Marking notification as read, ID:', notificationId);
    const response = await axios.patch(`${API_URL}/notifications/${notificationId}`, {
      status: 'read',
      readAt: new Date().toISOString(),
    });
    console.log('Mark notification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : 'No response from server',
    });
    throw new Error('خطا در به‌روزرسانی وضعیت نوتیفیکیشن', error);
  }
};
// Mark All Notifications as Read for a User
export const markAllNotificationsAsRead = async (userId) => {
  try {
    console.log('Marking all notifications as read for userId:', userId);
    const response = await axios.get(`${API_URL}/notifications`, {
      params: {
        userId,
        status: 'unread',
        deletedAt_null: true,
      },
    });
    const unreadNotifications = response.data;
    const updatePromises = unreadNotifications.map(notification =>
      axios.patch(`${API_URL}/notifications/${notification.id}`, {
        status: 'read',
        readAt: new Date().toISOString(),
      })
    );
    await Promise.all(updatePromises);
    console.log('All notifications marked as read for userId:', userId);
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : 'No response from server',
    });
    throw new Error('خطا در به‌روزرسانی وضعیت همه نوتیفیکیشن‌ها', error);
  }
};
// Delete Notification
export const deleteNotification = async (notificationId) => {
  try {
    console.log('Attempting to delete notification with ID:', notificationId);
    console.log('Sending PATCH request to:', `${API_URL}/notifications/${notificationId}`);
    const response = await axios.patch(`${API_URL}/notifications/${notificationId}`, {
      deletedAt: new Date().toISOString(),
    });
    console.log('Delete notification response:', {
      status: response.status,
      data: response.data,
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', {
      message: error.message,
      response: error.response ? {
        status: error.response.status,
        data: error.response.data,
      } : 'No response from server',
    });
    throw new Error('خطا در حذف نوتیفیکیشن: ' + error.message);
  }
};

/////////////////////////////////////////////Admins API//////////////////////////////////////////////
// اگر چند ادمین وجودداشت باید نوتیفیکیشن رزرو جدید برای همه ادمین ها ساخته بشه
export const fetchAdmins = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      params: {
        role:'Admin',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('خطا در دریافت لیست ادمین‌ها', error);
  }
};
///////////////stats API//////////////////////////////////////////////////////
// Fetch Reservation Stats
export const fetchReservationStats = async (dateRange) => {
    try {
        const params = {};
        if (dateRange) {
            params.startDate = dateRange[0].format('YYYY-MM-DD');
            params.endDate = dateRange[1].format('YYYY-MM-DD');
        }
        const response = await axios.get(`${API_URL}/reservations`, { params });
        return response.data;
    } catch (error) {
        throw new Error('خطا در دریافت آمار رزروها',error);
    }
};

// Fetch Financial Stats
export const fetchFinancialStats = async (dateRange) => {
    try {
        const params = {};
        if (dateRange) {
            params.startDate = dateRange[0].format('YYYY-MM-DD');
            params.endDate = dateRange[1].format('YYYY-MM-DD');
        }

        const response = await axios.get(`${API_URL}/financials`, { params });
        return response.data;
    } catch (error) {
        throw new Error('خطا در دریافت آمار مالی',error);
    }
};

// Booking Stats APIs/////////////////////////////////////////////////
export const fetchBookingStats = async () => {
  try {
    // 1. Get all reservations
    const reservationsResponse = await axios.get(`${API_URL}/reservations`);
    const reservations = reservationsResponse.data;

    // 2. Calculate stats
    const stats = {
      totalBookings: reservations.length,
      averageSatisfaction: 0,
      totalRevenue: 0,
      pieChart: {
        data: [],
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
          type: 'outer',
          content: '{name} {percentage}'
        }
      }
    };

    // Calculate average satisfaction
    const totalSatisfaction = reservations.reduce((sum, res) => sum + (res.rating || 0), 0);
    stats.averageSatisfaction = totalSatisfaction / (reservations.length || 1);

    // Calculate total revenue
    stats.totalRevenue = reservations.reduce((sum, res) => sum + (res.amount || 0), 0);

    // Calculate room type distribution for pie chart
    const roomTypes = {};
    reservations.forEach(res => {
      if (res.roomType) {
        roomTypes[res.roomType] = (roomTypes[res.roomType] || 0) + 1;
      }
    });

    stats.pieChart.data = Object.entries(roomTypes).map(([type, count]) => ({
      type,
      value: count
    }));

    return stats;

  } catch (error) {
    throw new Error('خطا در دریافت آمار رزروها',error);
  }
};
/////////////////////////////// Revenue APIs///////////////////////////////////////////////////////
export const fetchRevenue = async (dateRange) => {
  try {
    const [startDate, endDate] = dateRange;
    
    // Get reservations within date range
    const response = await axios.get(`${API_URL}/reservations`, {
      params: {
        checkIn_gte: startDate?.format('YYYY-MM-DD'),
        checkIn_lte: endDate?.format('YYYY-MM-DD'),
      }
    });
    const reservations = response.data;
    // Calculate total revenue
    const totalRevenue = reservations.reduce((sum, res) => sum + (res.amount || 0), 0);
    // Prepare data for line chart
    const revenueByDate = {};
    reservations.forEach(res => {
      const date = res.checkIn.split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + (res.amount || 0);
    });
    const chartData = Object.entries(revenueByDate).map(([date, amount]) => ({
      date,
      amount
    }));

    // Prepare financial report
    const report = Object.entries(revenueByDate).map(([date, revenue]) => ({
      date,
      revenue,
      expenses: Math.round(revenue * 0.3), // Dummy expenses (30% of revenue)
      profit: Math.round(revenue * 0.7) // Dummy profit (70% of revenue)
    }));

    return {
      totalRevenue,
      chart: {
        data: chartData,
        xField: 'date',
        yField: 'amount',
        xAxis: {
          type: 'time',
          tickCount: 5,
        }
      },
      report
    };

  } catch (error) {
    throw new Error('خطا در دریافت اطلاعات مالی',error);
  }
};
// ////////////////////////////////////Message APIs////////////////////////////////////////////////////
export const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/messages`, {
        params: {
          recipient_like: `${userId}|all`,
          _sort: 'createdAt',
          _order: 'desc'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('خطا در دریافت پیام‌ها',error);
    }
  };
  
  // ارسال پیام
  export const sendMessage = async (messageData) => {
    try {
      const data = {
        id: `msg${Date.now()}`,
        title: messageData.title,
        content: messageData.content,
        sender: {
          id: messageData.sender || 'admin',
          name: messageData.senderName || 'مدیر سیستم'
        },
        recipient: messageData.recipient,
        recipientType: messageData.recipientType || 'all',
        createdAt: new Date().toISOString(),
        status: 'unread',
        isPublic: messageData.recipient === 'all'
      };
  
      const response = await axios.post(`${API_URL}/messages`, data);
      return response.data;
    } catch (error) {
      throw new Error('خطا در ارسال پیام',error);
    }
  };
  
  // دریافت پیام‌های عمومی
  export const fetchPublicMessages = async () => {
    try {
      const response = await axios.get(`${API_URL}/messages`, {
        params: {
          isPublic: true,
          _sort: 'createdAt',
          _order: 'desc'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error('خطا در دریافت پیام‌های عمومی',error);
    }
  };
    
  // خواندن پیام
  export const markMessageAsRead = async (messageId) => {
    try {
      const response = await axios.patch(`${API_URL}/messages/${messageId}`, {
        status: 'read',
        readAt: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      throw new Error('خطا در به‌روزرسانی وضعیت پیام',error);
    }
  };
  
  // حذف پیام
  export const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${API_URL}/messages/${messageId}`);
      return true;
    } catch (error) {
      throw new Error('خطا در حذف پیام',error);
    }
  };
  
  // دریافت تعداد پیام‌های نخوانده
  export const getUnreadMessagesCount = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/messages`, {
        params: {
          recipient: userId,
          status: 'unread',
          _limit: 0
        }
      });
      return parseInt(response.headers['x-total-count']) || 0;
    } catch (error) {
      throw new Error('خطا در دریافت تعداد پیام‌های نخوانده',error);
    }
  };
// Fetch Financial Reports
export const fetchFinancialReports = async (dateRange) => {
    try {
        const params = {};
        if (dateRange) {
            params.startDate = dateRange[0].format('YYYY-MM-DD');
            params.endDate = dateRange[1].format('YYYY-MM-DD');
        }

        const response = await axios.get(`${API_URL}/financial-reports`, { params });
        return response.data;
    } catch (error) {
        throw new Error('خطا در دریافت گزارشات مالی',error);
    }
};
///////////////////CONTENT API/////////////////////////////////////////////////////////////////////////////////
//محتوای هتل ها
export const fetchContent = async (hotelId) => {
  if (!hotelId) throw new Error('شناسه هتل الزامی است');

  const { data: hotel } = await axios.get(`${API_URL}/hotels/${hotelId}`);

  // ساخت content پیش‌فرض
  const defaultContent = {
    aboutHotel: hotel.content?.aboutHotel || hotel.aboutHotel || '',
    rules: hotel.content?.rules || hotel.rules || '',
    images: hotel.content?.images || hotel.images || [],
    amenities: {
      general: hotel.amenities?.general || [],
      wellness: hotel.amenities?.wellness || [],
      dining: hotel.amenities?.dining || [],
    },
  };
  // اگر content وجود نداشت → PATCH بزن
  if (!hotel.content) {
    await axios.patch(`${API_URL}/hotels/${hotelId}`, {
      ...hotel,
      content: defaultContent,
      amenities: defaultContent.amenities,
    });
  }
  // همیشه مقدار نهایی (پس از PATCH) را برگردان
  return hotel.content ?? defaultContent;
};
//////ویرایش محتوای هر هتل
export const updateContent = async (data) => {
  try {
    const { hotelId, content } = data;
    const hotelResponse = await axios.get(`${API_URL}/hotels/${hotelId}`);
    const hotel = hotelResponse.data;
    // اطمینان از حفظ داده‌های Base64 تصاویر
    const images = content.images?.map(img => ({
      ...img,
      data: img.data // حفظ داده Base64
    })) || [];
    const updatedContent = {
      ...content,
      images,
      amenities: {
        general: content.amenities?.general || [],
        wellness: content.amenities?.wellness || [],
        dining: content.amenities?.dining || []
      }
    };
    const updatedHotel = {
      ...hotel,
      content: updatedContent,
      aboutHotel: content.aboutHotel,
      rules: content.rules,
      amenities: content.amenities
    };
    const response = await axios.patch(`${API_URL}/hotels/${hotelId}`, updatedHotel);
    return response.data;
  } catch (error) {
    console.error('Error updating content:', error);
    throw new Error('خطا در به‌روزرسانی محتوا');
  }
};
//ویرایش عکس هتل
export const uploadHotelImage = async (hotelId, file) => {
  try {
    // تبدیل فایل به Base64
    const base64 = await convertFileToBase64(file);
    
    const hotelResponse = await axios.get(`${API_URL}/hotels/${hotelId}`);
    const hotel = hotelResponse.data;
    const newImage = {
      id: Date.now(),
      data: base64, // ذخیره تصویر به صورت Base64
      title: file.name,
      createdAt: new Date().toISOString()
    };
    const updatedContent = {
      ...hotel.content,
      images: [...(hotel.content?.images || []), newImage]
    };
    await axios.patch(`${API_URL}/hotels/${hotelId}`, {
      ...hotel,
      content: updatedContent
    });
    return newImage;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('خطا در آپلود تصویر');
  }
};
// تابع کمکی برای تبدیل فایل به Base64
const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};
// برای حذف تصویر
export const deleteHotelImage = async (hotelId, imageId) => {
  try {
    const hotelResponse = await axios.get(`${API_URL}/hotels/${hotelId}`);
    const hotel = hotelResponse.data;
    // حذف تصویر از آرایه تصاویر
    const updatedContent = {
      ...hotel.content,
      images: hotel.content?.images?.filter(img => img.id !== imageId) || []
    };
    // به‌روزرسانی هتل
    await axios.patch(`${API_URL}/hotels/${hotelId}`, {
      ...hotel,
      content: updatedContent
    });
    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw new Error('خطا در حذف تصویر');
  }
};
//
// Get content
export const getContent = async () => {
  try {
    const response = await axios.get(`${API_URL}/content`);
    return response.data[0] || {};
  } catch (error) {
    throw new Error('خطا در دریافت محتوا',error);
  }
};
// Export all APIs
export default {
    // Auth
    getUserByEmail,
    updateUserLogin,  

    // Users
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  
    // Hotels
    fetchHotels,
    fetchHotelDetails,
    createHotel,
    updateHotel,
    deleteHotel,
    deleteReservation,

    // Reservations
    fetchReservations,
    fetchUserReservations,
    createReservation,

    // Rooms
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,

    // Favorites
    toggleFavorite,
    fetchFavoriteHotels,

    // Transactions
    fetchTransactions,

    // Notifications
    createNotification,
    fetchNotifications,
    deleteNotification,
    markAllNotificationsAsRead,
    markNotificationAsRead,

    // Reservation Stats
    fetchReservationStats,

    // Financial Stats
    fetchFinancialStats,

    // Messages
    fetchMessages,
    sendMessage,
    fetchPublicMessages,

    // Financial Reports
    fetchFinancialReports,
    updateUserProfile,
    
    // Stats & Reports
    fetchBookingStats,
    fetchRevenue,

    // Content Management
    fetchContent,
    updateContent,
    getContent,
    fetchAdmins,

}

