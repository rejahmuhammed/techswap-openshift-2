// --- Cart hook ---
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;  // price at time of addition
  name: string;
  image?: string;
}

export const useCart = () => {
  const queryClient = useQueryClient();

  // Load cart from localStorage on init
  const cart = localStorage.getItem('techswap_cart')
    ? JSON.parse(localStorage.getItem('techswap_cart'))
    : [];

  return useQuery<CartItem[]>({
    queryKey: ['cart'],
    queryFn: () => Promise.resolve(cart),
    // Persist to localStorage on change
    onSuccess: (data) => {
      localStorage.setItem('techswap_cart', JSON.stringify(data));
    },
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      // Fetch product details
      const productResponse = await api.get(`/products/${productId}`);
      const product = productResponse.data.data;

      const newItem: CartItem = {
        productId,
        quantity: 1,
        price: product.price,
        name: product.name,
        image: product.image_url,
      };

      // Add to cart state
      const currentCart = queryClient.getQueryData<CartItem[]>(['cart']) || [];
      const existingIndex = currentCart.findIndex((item) => item.productId === productId);

      if (existingIndex >= 0) {
        currentCart[existingIndex].quantity += 1;
      } else {
        currentCart.push(newItem);
      }

      queryClient.setQueryData(['cart'], currentCart);
      localStorage.setItem('techswap_cart', JSON.stringify(currentCart));

      return newItem;
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => {
      const currentCart = queryClient.getQueryData<CartItem[]>(['cart']) || [];
      const updatedCart = currentCart.filter((item) => item.productId !== productId);
      queryClient.setQueryData(['cart'], updatedCart);
      localStorage.setItem('techswap_cart', JSON.stringify(updatedCart));
      return updatedCart;
    },
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => {
      const currentCart = queryClient.getQueryData<CartItem[]>(['cart']) || [];
      const item = currentCart.find((item) => item.productId === productId);

      if (item) {
        item.quantity = Math.max(0, quantity);
        if (item.quantity === 0) {
          // Remove if quantity is 0
          queryClient.setQueryData(['cart'], currentCart.filter((i) => i.productId !== productId));
          localStorage.setItem('techswap_cart', JSON.stringify(currentCart.filter((i) => i.productId !== productId)));
        } else {
          queryClient.setQueryData(['cart'], currentCart);
          localStorage.setItem('techswap_cart', JSON.stringify(currentCart));
        }
      }

      return currentCart;
    },
  });
};

// --- Checkout hook ---
export interface CheckoutInfo {
  items: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
  total_amount: number;
  payment_method?: string;
}

export interface OrderResult {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
}

export const useCheckout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (checkoutData: CheckoutInfo) => {
      const response = await api.post('/orders/from-cart', checkoutData);
      return response.data;
    },
    onSuccess: (data) => {
      // Clear cart after successful order
      queryClient.setQueryData(['cart'], []);
      localStorage.removeItem('techswap_cart');
      // Re-fetch user orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};