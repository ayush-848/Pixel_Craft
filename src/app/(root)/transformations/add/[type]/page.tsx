import React from 'react'
import Header from '@/components/shared/Header'
import { transformationTypes } from '@/constants'
import TransformationForm from '@/components/shared/TransformationForm';
import { auth } from '@clerk/nextjs/server';
import { getUserById } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

const AddTransformType = async ({ params: { type } }: SearchParamProps) => {
  const {userId}=auth();
  const transformations = transformationTypes[type];

  if(!userId) redirect('/sign-in')

  const user = await getUserById(userId);
  

  return (
    <>
    <Header
      title={transformations.title}
      subtitle={transformations.subTitle}
    />

    <TransformationForm
    action='Add'
    userId={user._id}
    type={transformations.type as TransformationTypeKey}
    creditBalance={user.creditBalance}
    />
    </>
  );
};

export default AddTransformType;
