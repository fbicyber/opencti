import {
  addThreatActorIndividual,
  findAll, findById,
} from './threatActorIndividual-domain';
import { buildRefRelationKey } from '../../schema/general';
import {
  RELATION_BORN_IN,
  RELATION_CREATED_BY,
  RELATION_ETHNICITY,
  RELATION_OBJECT_ASSIGNEE, RELATION_OBJECT_LABEL,
  RELATION_OBJECT_MARKING
} from '../../schema/stixRefRelationship';
import {
  stixDomainObjectAddRelation,
  stixDomainObjectCleanContext,
  stixDomainObjectDelete, stixDomainObjectDeleteRelation,
  stixDomainObjectEditContext,
  stixDomainObjectEditField
} from '../../domain/stixDomainObject';
import type { Resolvers } from '../../generated/graphql';
import { heightEdit, heightWeightSort, weightEdit } from '../../mcas/threatActor';
import { batchLoader } from '../../database/middleware';
import { batchBornIn, batchEthnicity } from '../../domain/stixCoreObject';

const bornInLoader = batchLoader(batchBornIn);
const ethnicityLoader = batchLoader(batchEthnicity);

const threatActorIndividualResolvers: Resolvers = {
  Query: {
    threatActorIndividual: (_, { id }, context) => findById(context, context.user, id),
    threatActorsIndividuals: (_, args, context) => findAll(context, context.user, args),
  },
  ThreatActorIndividual: {
    bornIn: (threatActorIndividual, _, context) => bornInLoader.load(threatActorIndividual.id, context, context.user),
    ethnicity: (threatActorIndividual, _, context) => ethnicityLoader.load(threatActorIndividual.id, context, context.user),
  },
  ThreatActorsIndividualFilter: {
    createdBy: buildRefRelationKey(RELATION_CREATED_BY),
    bornIn: buildRefRelationKey(RELATION_BORN_IN),
    ethnicity: buildRefRelationKey(RELATION_ETHNICITY),
    assigneeTo: buildRefRelationKey(RELATION_OBJECT_ASSIGNEE),
    markedBy: buildRefRelationKey(RELATION_OBJECT_MARKING),
    labelledBy: buildRefRelationKey(RELATION_OBJECT_LABEL),
    creator: 'creator_id',
  },
  Mutation: {
    threatActorIndividualAdd: (_, { input }, context) => {
      return addThreatActorIndividual(context, context.user, input);
    },
    threatActorIndividualDelete: (_, { id }, context) => {
      return stixDomainObjectDelete(context, context.user, id);
    },
    threatActorIndividualFieldPatch: (_, { id, input }, context) => {
      return stixDomainObjectEditField(context, context.user, id, input);
    },
    threatActorIndividualHeightEdit: (_, { id, input, sort = true }, context) => {
      return heightEdit(context, context.user, id, input, sort as boolean);
    },
    threatActorIndividualWeightEdit: (_, { id, input, sort = true }, context) => {
      return weightEdit(context, context.user, id, input, sort as boolean);
    },
    threatActorIndividualHeightWeightSort: (_, { id }, context) => {
      return heightWeightSort(context, context.user, id);
    },
    threatActorIndividualContextPatch: (_, { id, input }, context) => {
      return stixDomainObjectEditContext(context, context.user, id, input);
    },
    threatActorIndividualContextClean: (_, { id }, context) => {
      return stixDomainObjectCleanContext(context, context.user, id);
    },
    threatActorIndividualRelationAdd: (_, { id, input }, context) => {
      return stixDomainObjectAddRelation(context, context.user, id, input);
    },
    threatActorIndividualRelationDelete: (_, { id, toId, relationship_type: relationshipType }, context) => {
      return stixDomainObjectDeleteRelation(context, context.user, id, toId, relationshipType);
    },
  },
};

export default threatActorIndividualResolvers;
