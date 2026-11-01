<?php

namespace App\Services\Mapping\Transformers;

class UppercaseTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): mixed
    {
        if (!is_string($value)) {
            return $value;
        }
        return mb_strtoupper($value, 'UTF-8');
    }
}
