import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useUser } from '../hooks/useHooks';
import { Button, Input, Card, Loading } from '../components';
import api from '../api';

function Sell() {
  const navigate = useNavigate();
  const { data: user } = useUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <Card>
          <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">Sell Electronics</h2>
          <p className="text-center text-gray-500">
            Please <Link to="/login" className="font-medium text-primary">login</Link> 
            to list your items for sale.
          </p>
        </Card>
      </div>
    );
  }

  const [
    title, setTitle,
    description, setDescription,
    category, setCategory,
    brand, setBrand,
    model, setModel,
    price, setPrice,
    condition, setCondition,
    location, setLocation,
  ] = useState([
    '', '', '', '', '', '', '', 0, 'NEW', ''
  ]);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validate required fields
    if (!title.trim() || !description.trim() || !category || !brand || price <= 0) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    // Build form data for product submission
    const formData = {
      name: title,
      description,
      category,
      brand,
      model: model || undefined,
      price: Math.round(price), // Ensure integer
      condition: condition as 'NEW' | 'PRE_OWNED',
      stock: 1, // Default stock
      seller_id: user.id,
      location: location || undefined,
    };

    try {
      const response = await api.post('/products', formData);
      const data = response.data;
      
      if (data.success) {
        // In a full implementation, we'd handle image upload here
        // For now, just show success and reset form
        setIsSubmitting(false);
        
        // Reset form
        setTitle(''); setDescription(''); setCategory(''); setBrand('');
        setModel(''); setPrice(0); setCondition('NEW'); setLocation('');
        
        // Navigate back to buy or show success
        alert('Listing created successfully!');
        navigate('/');
      } else {
        setError(data.error || 'Failed to create listing');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create listing');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-800 text-sm">
            {error}
          </div>
        )}
        
        <Card>
          <h2 className="text-xl font-medium text-gray-900 mb-6 text-center">Sell Your Electronics</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Product Name</Label>
                <Input
                  type="text"
                  placeholder="e.g., Kingston 1TB SSD"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="brand">Brand</Label>
                <Input
                  type="text"
                  placeholder="e.g., Kingston"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  type="text"
                  placeholder="e.g., KC3000"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                  required
                />
              </div>
            </div>
            
            {/* Category & Condition */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select Category</option>
                  <option>SSD</option>
                  <option>RAM</option>
                  <option>Laptop</option>
                  <option>Smartphone</option>
                  <option>Tablet</option>
                  <option>Graphics Card</option>
                  <option>Monitor</option>
                  <option>Keyboard</option>
                  <option>Mouse</option>
                  <option>Charger</option>
                  <option>Power Supply</option>
                  <option>Cable</option>
                  <option>Other Electronics</option>
                </select>
              </div>
              <div>
                <Label htmlFor="condition">Condition</Label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="NEW">New</option>
                  <option value="PRE_OWNED">Pre-Owned</option>
                </select>
              </div>
            </div>
            
            {/* Description & Location */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                type="textarea"
                placeholder="Describe the condition, specs, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                type="text"
                placeholder "e.g., Bangalore, India or 123 Main St"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full"
              />
            </div>
            
            {/* Images */}
            <div>
              <Label htmlFor="images">Product Images</Label>
              <p className="text-sm text-gray-500 mb-2">
                Upload images of your product (JPEG, PNG, WebP max 5MB)
              </p>
              <Input
                type="file"
                ref={imageInputRef}
                multiple
                accept="image/*,image/jpeg,image/png,image/webp"
                className="hidden"
              />
              <Button
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                className="w-full justify-center"
              >
                <span>Upload Images</span>
              </Button>
              <p className="text-xs text-gray-400 mt-2">
                Max 5 images, 5MB each. Supported: JPEG, PNG, WebP
              </p>
            </div>
            
            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Creating Listing...' : 'List for Sale'}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}

export default Sell;