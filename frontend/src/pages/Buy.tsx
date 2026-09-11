import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useHooks';
import { Button, Input, Card } from '../components';

function Buy() {
  const navigate = useNavigate();
  const { mutate: loginMutate, data: userData, isLoading } = useLogin();
  
  // Auto-login for demo purposes (remove in production)
  React.useEffect(() => {
    if (!localStorage.getItem('token') && !isLoading) {
      // Demo: auto-login with test credentials
      loginMutate({
        email: 'test@techswap.com',
        password: 'password123'
      });
    }
  }, [loginMutate, isLoading]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [filters, setFilters] = React.useState({
    category: '',
    brand: '',
    condition: '',
    minPrice: undefined,
    maxPrice: undefined,
    search: searchQuery,
  });

  const { data: products, isLoading: productsLoading, refetch } = useProducts(filters);

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery, page: 1 });
    refetch();
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value === '' ? undefined : value });
  };

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Card>
          <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">Buy Electronics</h2>
          <p className="text-center text-gray-500">
            Please <Link to="/login" className="font-medium text-primary">login</Link> 
            or <Link to="/register" className="font-medium text-primary">register</Link> 
            to browse products.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <section className="py-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Search & Filter Section */}
        <Card className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Find Electronics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category || 'All'}
                onChange={(e) => handleFilterChange({ name: 'category', value: e.target.value })}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                <option>SSD</option>
                <option>RAM</option>
                <option>Laptop</option>
                <option>Smartphone</option>
                <option>Tablet</option>
                <option>Graphics Card</option>
                <option>Monitor</option>
              </select>
            </div>
            
            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                value={filters.brand || 'All'}
                onChange={(e) => handleFilterChange({ name: 'brand', value: e.target.value })}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Brands</option>
                <option>Kingston</option>
                <option>Crucial</option>
                <option>Samsung</option>
                <option>Corsair</option>
                <option>Kingston</option>
              </select>
            </div>
            
            {/* Condition Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <select
                value={filters.condition || 'All'}
                onChange={(e) => handleFilterChange({ name: 'condition', value: e.target.value })}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Conditions</option>
                <option>New</option>
                <option>Pre-Owned</option>
              </select>
            </div>
            
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange({ name: 'minPrice', value: e.target.value })}
                  className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange({ name: 'maxPrice', value: e.target.value })}
                  className="rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary w-full"
                />
              </div>
            </div>
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                type="text"
                placeholder="Search products..."
                value={filters.search || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </Card>

        {/* Products Grid */}
        {isLoading && <p className="text-center py-8">Loading products...</p>}
        
        {products && products.data && products.data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.data.map((product) => (
              <Card
                key={product.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                )}
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {product.brand} {product.model || ''}
                </p>
                <p className="text-lg font-medium text-gray-900 mt-2">
                  ₹{product.price.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {product.condition} • Stock: {product.stock}
                </p>
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">No products found matching your criteria.</p>
            <Button
              onClick={handleSearch}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

export default Buy;