<?php

namespace App\Services\Mapping\Transformers;

use App\Services\Mapping\Exceptions\TransformationException;

class RequiredTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if ($value === null || (is_string($value) && trim($value) === '')) {
            throw new TransformationException('Campo obrigatório não pode ser vazio.', 'required', $value);
        }
        return $value;
    }
}
