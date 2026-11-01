<?php

namespace App\Services\Mapping\Transformers;

use App\Services\Mapping\Exceptions\TransformationException;

class SanitizeDocumentTransformer implements TransformerInterface
{
    public function transform(mixed $value, array $options = []): string
    {
        if ($value === null || $value === '') {
            if (!empty($options['nullable'])) {
                return '';
            }
            throw new TransformationException('Documento vazio não é permitido.', 'documento', $value);
        }

        // Extrai apenas dígitos
        $digits = preg_replace('/\D/', '', (string) $value) ?? '';

        // Se o Excel removeu o zero à esquerda do CPF (10 dígitos) ou CNPJ (13 dígitos)
        if (strlen($digits) === 10) {
            $digits = str_pad($digits, 11, '0', STR_PAD_LEFT);
        } elseif (strlen($digits) === 13) {
            $digits = str_pad($digits, 14, '0', STR_PAD_LEFT);
        }

        $validateChecksum = $options['validate_checksum'] ?? true;

        if (strlen($digits) === 11) {
            // Validação de CPF
            if ($validateChecksum && !$this->isValidCpf($digits)) {
                throw new TransformationException("CPF '{$value}' possui dígito verificador inválido ou dígitos repetidos.", 'cpf', $value);
            }
            return $digits;
        }

        if (strlen($digits) === 14) {
            // Validação de CNPJ
            if ($validateChecksum && !$this->isValidCnpj($digits)) {
                throw new TransformationException("CNPJ '{$value}' possui dígito verificador inválido.", 'cnpj', $value);
            }
            return $digits;
        }

        throw new TransformationException("Tamanho de documento inválido: {$digits} (esperado 11 para CPF ou 14 para CNPJ).", 'documento', $value);
    }

    private function isValidCpf(string $cpf): bool
    {
        if (preg_match('/^(\d)\1{10}$/', $cpf)) {
            return false; // Sequências como 111.111.111-11
        }

        for ($t = 9; $t < 11; $t++) {
            $d = 0;
            for ($c = 0; $c < $t; $c++) {
                $d += (int)$cpf[$c] * (($t + 1) - $c);
            }
            $d = ((10 * $d) % 11) % 10;
            if ((int)$cpf[$c] !== $d) {
                return false;
            }
        }
        return true;
    }

    private function isValidCnpj(string $cnpj): bool
    {
        if (preg_match('/^(\d)\1{13}$/', $cnpj)) {
            return false;
        }

        $b = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
        for ($i = 0, $n = 0; $i < 12; $n += (int)$cnpj[$i] * $b[++$i]);
        if ((int)$cnpj[12] !== ((($n %= 11) < 2) ? 0 : 11 - $n)) {
            return false;
        }

        for ($i = 0, $n = 0; $i <= 12; $n += (int)$cnpj[$i] * $b[$i++]);
        if ((int)$cnpj[13] !== ((($n %= 11) < 2) ? 0 : 11 - $n)) {
            return false;
        }

        return true;
    }
}
