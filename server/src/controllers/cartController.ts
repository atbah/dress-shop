import { Request, Response } from 'express';
import { Cart, User } from '../models';
import { User as UserTypes } from '../types';
import mongoose from 'mongoose';

const { ObjectId } = mongoose.Types;

export const index = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserTypes;
    const cart = await Cart.findOne({ user: user._id })
      .populate('items.product')
      .sort('-createdAt');

    res.status(200).json({ data: cart });
  } catch (error) {
    res.status(500).json({ message: 'Error in getting product' });
  }
};

export const store = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserTypes;
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: user._id });

    if (cart) {
      // make sure viewer is the owner of the cart
      if (user._id.toString() !== cart.user.toString()) {
        return res.status(405).json({
          message: 'You cannot perform this operation',
        });
      }

      const isProductExist = cart?.items.some((item) =>
        ObjectId(productId).equals(item.product)
      );

      if (isProductExist) {
        cart = await Cart.findOneAndUpdate(
          { _id: cart._id, 'items.product': productId },
          { $inc: { 'items.$.quantity': quantity } },
          { new: true }
        );
      } else {
        cart = await Cart.findOneAndUpdate(
          { _id: cart._id },
          { $addToSet: { items: { quantity, product: productId } } },
          { new: true }
        );
      }
    } else {
      cart = await Cart.create({
        user: user._id,
        items: [{ quantity, product: productId }],
      });
    }

    res.status(200).json({ data: cart });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error in creating cart' });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const user = req.user as UserTypes;
    const { id } = req.params;
    const { productId } = req.body;

    let cart = await Cart.findOne({ _id: id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    // make sure viewer is the owner of the cart
    if (user._id.toString() !== cart.user.toString()) {
      return res.status(405).json({
        message: 'You cannot perform this operation',
      });
    }

    cart = await Cart.findOneAndUpdate(
      { user: user._id },
      { $pull: { products: { product: productId } } },
      { new: true }
    ).populate({
      path: 'products.product',
      model: 'Product',
    });

    res.status(200).json({ data: cart });
  } catch (error) {
    res.status(500).json({ message: 'Error in getting product' });
  }
};
