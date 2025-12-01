import api from './api';

const CATEGORY_ROUTES = {
  list: '/api/categories',
  detail: (id: string) => `/api/categories/${id}`,
  create: '/api/categories',
  update: (id: string) => `/api/categories/${id}`,
  delete: (id: string) => `/api/categories/${id}`
};

export interface Category {
  _id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface CategoryCreateData {
  name: string;
  description?: string;
  active?: boolean;
}

export type CategoryUpdateData = Partial<CategoryCreateData>;

export const getCategories = async () => {
  const response = await api.get<Category[]>(CATEGORY_ROUTES.list);
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const response = await api.get<Category>(CATEGORY_ROUTES.detail(id));
  return response.data;
};

export const createCategory = async (categoryData: CategoryCreateData) => {
  const response = await api.post<Category>(CATEGORY_ROUTES.create, categoryData);
  return response.data;
};

export const updateCategory = async (id: string, categoryData: CategoryUpdateData) => {
  const response = await api.put<Category>(CATEGORY_ROUTES.update(id), categoryData);
  return response.data;
};

export const deleteCategory = async (id: string) => {
  const response = await api.delete(CATEGORY_ROUTES.delete(id));
  return response.data;
};