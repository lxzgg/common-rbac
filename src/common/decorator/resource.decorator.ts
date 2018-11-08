import {ReflectMetadata} from '@nestjs/common'

export const RESOURCE_DEFINITION = '__resource_definition__'

/**
 * 资源注解
 */
export const Resource = (options: { name: string, identify: string }) => ReflectMetadata(RESOURCE_DEFINITION, options)
