
import React, { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  author_name: string;
  comment: string;
  rating: number;
  created_at: string;
  user_id?: string;
}

interface ProductCommentsProps {
  productId: number;
}

export const ProductComments = ({ productId }: ProductCommentsProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    author_name: '',
    comment: '',
    rating: 5
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [productId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.author_name.trim() || !newComment.comment.trim()) {
      toast({
        title: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert([
          {
            product_id: productId,
            user_id: user?.id || null,
            author_name: newComment.author_name,
            comment: newComment.comment,
            rating: newComment.rating,
          }
        ]);

      if (error) throw error;

      toast({
        title: "Comment added successfully!",
      });

      setNewComment({
        author_name: '',
        comment: '',
        rating: 5
      });

      fetchComments();
    } catch (error: any) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-xl font-semibold mb-6 flex items-center">
        <MessageCircle className="mr-2" size={20} />
        Customer Reviews ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h4 className="font-semibold mb-4">Add Your Review</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="author_name">Your Name</Label>
            <Input
              id="author_name"
              value={newComment.author_name}
              onChange={(e) => setNewComment(prev => ({ ...prev, author_name: e.target.value }))}
              placeholder="Enter your name"
              required
            />
          </div>
          
          <div>
            <Label>Rating</Label>
            <div className="mt-1">
              {renderStars(newComment.rating, true, (rating) => 
                setNewComment(prev => ({ ...prev, rating }))
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={newComment.comment}
              onChange={(e) => setNewComment(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with this product..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" disabled={submitting}>
            {submitting ? 'Adding Review...' : 'Add Review'}
          </Button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white p-4 rounded-lg border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-semibold">{comment.author_name}</h5>
                  {renderStars(comment.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
